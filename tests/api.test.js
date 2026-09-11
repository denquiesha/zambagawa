const test = require('node:test');
const assert = require('node:assert/strict');

test('environment example does not contain a real secret', () => {
  const fs = require('node:fs');
  const value = fs.readFileSync('.env.example', 'utf8');
  assert.match(value, /sb_secret_your-secret-key/);
  assert.doesNotMatch(value, /eyJ[A-Za-z0-9_-]{20,}/);
});

test('database schema creates providers and bookings', () => {
  const fs = require('node:fs');
  const sql = fs.readFileSync('supabase/schema.sql', 'utf8');
  assert.match(sql, /create table if not exists public\.providers/i);
  assert.match(sql, /create table if not exists public\.bookings/i);
});
