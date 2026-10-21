import { randomBytes, scryptSync } from "node:crypto"

/**
 * Generate an ADMIN_PASSWORD_HASH value without printing the password.
 *
 * Usage:
 *   printf 'New admin password: '; IFS= read -rs P; printf '\n'
 *   printf '%s' "$P" | pnpm admin:password; unset P
 */
const N = 16384
const r = 8
const p = 1
const KEY_LENGTH = 64

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks).toString("utf8").replace(/\r?\n$/, "")
}

const password = await readStdin()

if (!password) {
  console.error("No password received on stdin.")
  process.exit(1)
}

if (password.length < 12) {
  console.error("Use a password with at least 12 characters.")
  process.exit(1)
}

if (password.length > 1024) {
  console.error("Password is too long (maximum 1024 characters).")
  process.exit(1)
}

const salt = randomBytes(16)
const hash = scryptSync(password, salt, KEY_LENGTH, {
  N,
  r,
  p,
  maxmem: 64 * 1024 * 1024,
})

console.log(
  `scrypt:N=${N},r=${r},p=${p}:${salt.toString("base64url")}:${hash.toString("base64url")}`
)
