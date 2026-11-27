# Security Specification — Para Marie

## 1. Data Invariants
1. Every document in `/memories/{memoryId}` must be owned by a verified authenticated user (`ownerId == request.auth.uid`, `email_verified == true`).
2. `memoryId` must match `^[a-zA-Z0-9_\-]+$` and be at most 128 characters.
3. `authorName` (1..80 chars), `replyMessage` (1..400 chars), `noAttemptsCount` (integer/number >= 0 and <= 10000), and `favoriteMoment` (`'itazura' | 'te_odio' | 'me_encantas'`) are strictly validated on both create and update.
4. `createdAt` and `ownerId` are immutable once created (`incoming().ownerId == existing().ownerId`, `incoming().createdAt == existing().createdAt`).
5. Both `createdAt` (on create) and `updatedAt` (on create and update) must strictly equal `request.time`.
6. Unauthenticated reads, blanket `list` queries without owner or verified admin scoping, and shadow fields are strictly denied.

## 2. The Dirty Dozen Payloads (All Must Return PERMISSION_DENIED)
1. Unauthenticated `create` to `/memories/mem1`.
2. Authenticated `create` with `email_verified == false`.
3. `create` with spoofed `ownerId` (`ownerId != request.auth.uid`).
4. `create` with an invalid document ID (`memoryId` containing spaces or `150` characters).
5. `create` with extra shadow field (`{ ..., isAdmin: true }`).
6. `create` with oversized `replyMessage` (> 400 characters).
7. `create` with invalid `favoriteMoment` (`'invalid_stage'`).
8. `create` with negative or non-numeric `noAttemptsCount` (`-5` or `'abc'`).
9. `create` with client-forged `createdAt` timestamp (`createdAt != request.time`).
10. `update` attempting to mutate immutable `ownerId` or `createdAt`.
11. `list` query by non-admin trying to read another user's `memories` (`resource.data.ownerId != request.auth.uid`).
12. Admin-only `list`/`get` spoofed with `email == 'edwinrafaelmf@gmail.com'` when `email_verified == false`.
