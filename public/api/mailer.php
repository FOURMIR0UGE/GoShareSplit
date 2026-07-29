<?php
declare(strict_types=1);

function smtp_config(): array {
  $config = [
    'host' => getenv('GSS_SMTP_HOST') ?: '',
    'port' => (int)(getenv('GSS_SMTP_PORT') ?: 465),
    'secure' => getenv('GSS_SMTP_SECURE') ?: 'ssl',
    'username' => getenv('GSS_SMTP_USERNAME') ?: '',
    'password' => getenv('GSS_SMTP_PASSWORD') ?: '',
    'from_email' => getenv('GSS_FROM_EMAIL') ?: '',
    'from_name' => getenv('GSS_FROM_NAME') ?: 'GoShareSplit',
    'site_url' => rtrim(getenv('GSS_SITE_URL') ?: '', '/'),
  ];
  $local = __DIR__ . '/smtp-config.php';
  if (is_file($local)) {
    $override = require $local;
    if (is_array($override)) $config = array_merge($config, $override);
  }
  return $config;
}

function smtp_read($socket): string {
  $response = '';
  while (($line = fgets($socket, 515)) !== false) {
    $response .= $line;
    if (strlen($line) < 4 || $line[3] === ' ') break;
  }
  return $response;
}

function smtp_expect($socket, array $codes): string {
  $response = smtp_read($socket);
  $code = (int)substr($response, 0, 3);
  if (!in_array($code, $codes, true)) {
    throw new RuntimeException('SMTP ' . $code . ': ' . trim($response));
  }
  return $response;
}

function smtp_command($socket, string $command, array $codes): string {
  fwrite($socket, $command . "\r\n");
  return smtp_expect($socket, $codes);
}

function encode_header(string $value): string {
  return '=?UTF-8?B?' . base64_encode($value) . '?=';
}

function send_smtp_mail(string $to, string $subject, string $html, string $text = ''): bool {
  $cfg = smtp_config();
  foreach (['host','username','password','from_email'] as $required) {
    if (trim((string)$cfg[$required]) === '') return false;
  }

  $host = (string)$cfg['host'];
  $port = (int)$cfg['port'];
  $secure = strtolower((string)$cfg['secure']);
  $transport = $secure === 'ssl' ? 'ssl://' : '';
  $socket = @stream_socket_client($transport . $host . ':' . $port, $errno, $errstr, 15, STREAM_CLIENT_CONNECT);
  if (!$socket) throw new RuntimeException("Connexion SMTP impossible: $errstr ($errno)");
  stream_set_timeout($socket, 15);

  try {
    smtp_expect($socket, [220]);
    $hostname = $_SERVER['SERVER_NAME'] ?? 'localhost';
    smtp_command($socket, 'EHLO ' . $hostname, [250]);
    if ($secure === 'tls') {
      smtp_command($socket, 'STARTTLS', [220]);
      if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
        throw new RuntimeException('Activation TLS impossible.');
      }
      smtp_command($socket, 'EHLO ' . $hostname, [250]);
    }
    smtp_command($socket, 'AUTH LOGIN', [334]);
    smtp_command($socket, base64_encode((string)$cfg['username']), [334]);
    smtp_command($socket, base64_encode((string)$cfg['password']), [235]);
    smtp_command($socket, 'MAIL FROM:<' . $cfg['from_email'] . '>', [250]);
    smtp_command($socket, 'RCPT TO:<' . $to . '>', [250, 251]);
    smtp_command($socket, 'DATA', [354]);

    $boundary = 'gss_' . bin2hex(random_bytes(12));
    $headers = [
      'Date: ' . date(DATE_RFC2822),
      'From: ' . encode_header((string)$cfg['from_name']) . ' <' . $cfg['from_email'] . '>',
      'To: <' . $to . '>',
      'Subject: ' . encode_header($subject),
      'MIME-Version: 1.0',
      'Content-Type: multipart/alternative; boundary="' . $boundary . '"',
      'Message-ID: <' . bin2hex(random_bytes(12)) . '@' . $hostname . '>',
    ];
    $text = $text !== '' ? $text : trim(strip_tags(str_replace(['<br>','<br/>','<br />'], "\n", $html)));
    $message = implode("\r\n", $headers) . "\r\n\r\n";
    $message .= '--' . $boundary . "\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($text));
    $message .= '--' . $boundary . "\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html));
    $message .= '--' . $boundary . "--\r\n";
    $message = preg_replace('/^\./m', '..', $message) ?: $message;
    fwrite($socket, $message . "\r\n.\r\n");
    smtp_expect($socket, [250]);
    smtp_command($socket, 'QUIT', [221]);
    fclose($socket);
    return true;
  } catch (Throwable $e) {
    fclose($socket);
    error_log('[GoShareSplit SMTP] ' . $e->getMessage());
    return false;
  }
}

function mail_layout(string $title, string $content, string $buttonLabel = '', string $buttonUrl = ''): string {
  $button = ($buttonLabel !== '' && $buttonUrl !== '')
    ? '<p style="margin:28px 0"><a href="' . htmlspecialchars($buttonUrl, ENT_QUOTES) . '" style="display:inline-block;background:#34d399;color:#06111d;text-decoration:none;padding:14px 22px;border-radius:12px;font-weight:800">' . htmlspecialchars($buttonLabel) . '</a></p>'
    : '';
  return '<!doctype html><html lang="fr"><body style="margin:0;background:#07101f;font-family:Arial,sans-serif;color:#e5eefb"><div style="max-width:620px;margin:0 auto;padding:32px 18px"><div style="background:#101a2d;border:1px solid #25324a;border-radius:20px;padding:28px"><div style="font-size:22px;font-weight:900;margin-bottom:22px">GoShare<span style="color:#34d399">Split</span></div><h1 style="font-size:24px;margin:0 0 18px">' . htmlspecialchars($title) . '</h1><div style="line-height:1.65;color:#cbd5e1">' . $content . '</div>' . $button . '<p style="margin-top:30px;font-size:12px;color:#64748b">E-mail envoyé automatiquement par GoShareSplit.</p></div></div></body></html>';
}
