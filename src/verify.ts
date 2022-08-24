import { Env } from '.';

function hex2bin(hex: string) {
  const buf = new Uint8Array(Math.ceil(hex.length / 2));
  for (var i = 0; i < buf.length; i++) {
    buf[i] = parseInt(hex.substring(i * 2, 2), 16);
  }
  return buf;
}

const PUBLIC_KEY = (publicKey: string) =>
  crypto.subtle.importKey(
    'raw',
    hex2bin(publicKey),
    {
      name: 'NODE-ED25519',
      namedCurve: 'NODE-ED25519',
    },
    true,
    ['verify']
  );

const encoder = new TextEncoder();

export async function verify(request: Request, env: Env) {
  const signature = hex2bin(request.headers.get('X-Signature-Ed25519')!);
  const timestamp = request.headers.get('X-Signature-Timestamp');
  const unknown = await request.clone().text();

  return await crypto.subtle.verify(
    'NODE-ED25519',
    await PUBLIC_KEY(env.DISCORD_PUBLIC_KEY),
    signature,
    encoder.encode(timestamp + unknown)
  );
}
