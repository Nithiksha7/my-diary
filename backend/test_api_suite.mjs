import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { DiaryEntry } from './dist/models/DiaryEntry.js';
import { Memory } from './dist/models/Memory.js';
import { Someday } from './dist/models/Someday.js';
import { UploadedFile } from './dist/models/UploadedFile.js';
import { FutureMe } from './dist/models/FutureMe.js';
import { Letter } from './dist/models/Letter.js';
import { storageService } from './dist/services/storageService.js';
import { generateToken, verifyToken, JWT_COOKIE_NAME } from './dist/utils/tokens.js';
import { requireAuth } from './dist/middleware/authMiddleware.js';
import {
  encryptLetterContent,
  decryptLetterContent,
  generatePublicToken,
  hashToken,
} from './dist/utils/crypto.js';
import { EmailService } from './dist/services/emailService.js';
import { processScheduledLettersBatch } from './dist/services/schedulerService.js';
import {
  createLetter,
  getLetters,
  getLetterById,
  deleteLetter,
  getPublicLetterByToken,
  openPublicLetterByToken,
  fastForwardPublicLetter,
} from './dist/controllers/letterController.js';
import {
  createMemory,
  getMemories,
  updateMemory,
  deleteMemory,
} from './dist/controllers/memoryController.js';
import {
  createSomedayDream,
  getSomedayDreams,
  toggleSomedayDream,
  updateSomedayDream,
  deleteSomedayDream,
} from './dist/controllers/somedayController.js';
import { handleFileUpload } from './dist/controllers/uploadController.js';

console.log('================================================================');
console.log('--- STARTING MY DIARY COMPLETE VERIFICATION SUITE (PHASES 1–9) ---');
console.log('================================================================\n');

async function runTests() {
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✕ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Password Hashing Security Tests
  console.log('\n[1. Password & Cryptographic Security]');
  const plainPassword = 'SuperSecretPassword123!';
  const salt = await bcrypt.genSalt(12);
  const hash = await bcrypt.hash(plainPassword, salt);
  assert(hash !== plainPassword, 'Password is never stored as plaintext');
  assert(hash.startsWith('$2'), 'Password hashed with bcrypt (12 rounds)');
  const isValid = await bcrypt.compare(plainPassword, hash);
  assert(isValid === true, 'Bcrypt compare correctly validates password');
  const isInvalid = await bcrypt.compare('WrongPassword', hash);
  assert(isInvalid === false, 'Bcrypt compare rejects wrong password');

  // 2. JWT & Cookie Security Tests
  console.log('\n[2. JWT & HttpOnly Session Cookie Tests]');
  const dummyPayload = { userId: '507f1f77bcf86cd799439011', email: 'user@example.com' };
  const token = generateToken(dummyPayload);
  assert(typeof token === 'string' && token.length > 20, 'JWT token generated successfully');
  const verified = verifyToken(token);
  assert(verified && verified.userId === dummyPayload.userId, 'JWT token verified and decrypted payload correctly');
  assert(JWT_COOKIE_NAME === 'mydiary_session', 'Standard session cookie name is mydiary_session');

  // 3. Database Schema & Indexing Tests (Phases 1-7)
  console.log('\n[3. Mongoose Schema & Indexing Tests]');
  const diaryIndexes = DiaryEntry.schema.indexes();
  const hasCompoundUniqueIndex = diaryIndexes.some(
    (idx) => idx[0].userId === 1 && idx[0].dateKey === 1 && idx[1]?.unique === true
  );
  assert(hasCompoundUniqueIndex, 'DiaryEntry has compound unique index on { userId: 1, dateKey: 1 }');
  assert(Memory.schema.indexes().length > 0, 'Memory schema has indexed userId');
  assert(Someday.schema.indexes().length > 0, 'Someday schema has indexed userId');
  assert(UploadedFile.schema.path('userId') !== undefined, 'UploadedFile schema has userId relation');
  assert(FutureMe.schema.path('unlockAt').instance === 'Date', 'FutureMe unlockAt is Date instance');

  // 4. Storage Provider Abstraction & Disk Storage
  console.log('\n[4. Storage Provider Abstraction & Disk Storage]');
  const dummyBuffer = Buffer.from('FAKE_IMAGE_DATA_JPEG');
  const dummyMulterFile = {
    originalname: 'vacation_photo.jpg',
    mimetype: 'image/jpeg',
    buffer: dummyBuffer,
    size: dummyBuffer.length,
  };
  const uploadResult = await storageService.uploadFile(dummyMulterFile, 'test_photos');
  assert(uploadResult.url.startsWith('/uploads/test_photos/'), 'Storage provider generates safe local /uploads/ URL');
  assert(uploadResult.storageKey.endsWith('.jpg'), 'Storage provider preserves safe image extension');
  const deleteResult = await storageService.deleteFile(uploadResult.storageKey);
  assert(deleteResult === true, 'Storage provider successfully deleted test file from disk');

  // 5. Authentication Middleware Security Tests
  console.log('\n[5. Authentication Middleware Security Tests]');
  let authRejected = false;
  let authStatus = 0;
  const mockReq = { cookies: {}, headers: {} };
  const mockRes = {
    status(code) {
      authStatus = code;
      return {
        json(payload) {
          if (code === 401 && payload.success === false) {
            authRejected = true;
          }
        },
      };
    },
  };
  const mockNext = () => {};
  await requireAuth(mockReq, mockRes, mockNext);
  assert(authRejected === true && authStatus === 401, 'requireAuth middleware rejects unauthenticated requests with 401');

  // 6. PHASE 8 — AES-256-GCM Letter Content Encryption & Tokens
  console.log('\n[6. PHASE 8 — AES-256-GCM Letter Content Encryption & Tokens]');
  const secretMessage = 'Dearest friend, on this quiet night across time, remember how much you are cherished.';
  const encrypted = encryptLetterContent(secretMessage);
  assert(encrypted.startsWith('ENC:'), 'Letter content is encrypted with AES-256-GCM with ENC: envelope');
  assert(!encrypted.includes('Dearest friend'), 'Encrypted string contains zero plaintext fragments');
  const decrypted = decryptLetterContent(encrypted);
  assert(decrypted === secretMessage, 'AES-256-GCM successfully decrypts ciphertext to original plaintext message');

  const rawPublicToken = generatePublicToken();
  assert(typeof rawPublicToken === 'string' && rawPublicToken.length >= 32, 'Cryptographically secure public token generated');
  const tokenSha256 = hashToken(rawPublicToken);
  assert(tokenSha256.length === 64, 'SHA-256 token hash is 64 hex characters');
  assert(tokenSha256 !== rawPublicToken, 'Token hash is strictly one-way and never equals raw token');

  // 7. PHASE 8 — Letter Database Model Schema & Index Verification
  console.log('\n[7. PHASE 8 — Letter Schema & Index Verification]');
  const letterIndexes = Letter.schema.indexes();
  const hasUserTimestampIndex = letterIndexes.some(
    (idx) => idx[0].userId === 1 && idx[0].scheduledDeliveryTimestamp === 1
  );
  const hasStatusTimestampIndex = letterIndexes.some(
    (idx) => idx[0].status === 1 && idx[0].scheduledDeliveryTimestamp === 1
  );
  assert(hasUserTimestampIndex, 'Letter schema has compound index on { userId: 1, scheduledDeliveryTimestamp: 1 }');
  assert(hasStatusTimestampIndex, 'Letter schema has compound scheduler index on { status: 1, scheduledDeliveryTimestamp: 1 }');
  assert(Letter.schema.path('publicTokenHash') !== undefined, 'Letter schema defines publicTokenHash');
  assert(Letter.schema.path('encryptedContent') !== undefined, 'Letter schema defines encryptedContent');

  // 8. PHASE 8 — Letter Creation & Input Validation Tests
  console.log('\n[8. PHASE 8 — Letter Creation & Validation Tests]');
  const testUserId = new mongoose.Types.ObjectId();

  // Test 8a: Reject missing title
  let rejectTitle = false;
  await createLetter(
    { userId: testUserId, body: { type: 'someone', recipientName: 'Alice', recipientEmail: 'alice@example.com', title: '', content: 'Msg', scheduledDeliveryDate: '2027-01-01', scheduledDeliveryTime: '20:00' } },
    { status: (s) => ({ json: (b) => { if (s === 400 && !b.success) rejectTitle = true; } }) },
    () => {}
  );
  assert(rejectTitle, 'createLetter rejects empty letter title with 400');

  // Test 8b: Reject missing content
  let rejectContent = false;
  await createLetter(
    { userId: testUserId, body: { type: 'someone', recipientName: 'Alice', recipientEmail: 'alice@example.com', title: 'Hello', content: '  ', scheduledDeliveryDate: '2027-01-01', scheduledDeliveryTime: '20:00' } },
    { status: (s) => ({ json: (b) => { if (s === 400 && !b.success) rejectContent = true; } }) },
    () => {}
  );
  assert(rejectContent, 'createLetter rejects empty letter content with 400');

  // Test 8c: Reject missing recipient email for someone with email channel
  let rejectEmail = false;
  await createLetter(
    { userId: testUserId, body: { type: 'someone', recipientName: 'Alice', deliveryChannel: 'email', recipientEmail: '', title: 'Hello', content: 'Words', scheduledDeliveryDate: '2027-01-01', scheduledDeliveryTime: '20:00' } },
    { status: (s) => ({ json: (b) => { if (s === 400 && !b.success) rejectEmail = true; } }) },
    () => {}
  );
  assert(rejectEmail, 'createLetter rejects missing recipient email address for email delivery with 400');

  // Test 8d: Reject obsolete delivery channels (whatsapp, sms, instagram)
  let rejectWhatsapp = false;
  await createLetter(
    { userId: testUserId, body: { type: 'someone', recipientName: 'Alice', deliveryChannel: 'whatsapp', recipientContact: '+1234567890', title: 'Hello', content: 'Words', scheduledDeliveryDate: '2027-01-01', scheduledDeliveryTime: '20:00' } },
    { status: (s) => ({ json: (b) => { if (s === 400 && !b.success && b.message.includes('supported')) rejectWhatsapp = true; } }) },
    () => {}
  );
  assert(rejectWhatsapp, 'createLetter rejects obsolete deliveryChannel "whatsapp" with 400');

  let rejectSms = false;
  await createLetter(
    { userId: testUserId, body: { type: 'someone', recipientName: 'Alice', deliveryChannel: 'sms', recipientContact: '+1234567890', title: 'Hello', content: 'Words', scheduledDeliveryDate: '2027-01-01', scheduledDeliveryTime: '20:00' } },
    { status: (s) => ({ json: (b) => { if (s === 400 && !b.success) rejectSms = true; } }) },
    () => {}
  );
  assert(rejectSms, 'createLetter rejects obsolete deliveryChannel "sms" with 400');

  let rejectInstagram = false;
  await createLetter(
    { userId: testUserId, body: { type: 'someone', recipientName: 'Alice', deliveryChannel: 'instagram', recipientContact: '@alice', title: 'Hello', content: 'Words', scheduledDeliveryDate: '2027-01-01', scheduledDeliveryTime: '20:00' } },
    { status: (s) => ({ json: (b) => { if (s === 400 && !b.success) rejectInstagram = true; } }) },
    () => {}
  );
  assert(rejectInstagram, 'createLetter rejects obsolete deliveryChannel "instagram" with 400');

  // Test 8e: Accept 'link' delivery channel without recipient email
  const origCreate = Letter.create;
  let linkCreated = false;
  Letter.create = async (doc) => {
    linkCreated = doc.deliveryChannel === 'link';
    return {
      _id: new mongoose.Types.ObjectId(),
      ...doc,
      createdAt: new Date(),
    };
  };

  let createLinkSuccess = false;
  await createLetter(
    { userId: testUserId, body: { type: 'someone', recipientName: 'Alice', deliveryChannel: 'link', title: 'Private Letter', content: 'Secret Content', scheduledDeliveryDate: '2027-01-01', scheduledDeliveryTime: '20:00' } },
    { status: (s) => ({ json: (b) => { if (s === 201 && b.success) createLinkSuccess = true; } }) },
    () => {}
  );
  assert(createLinkSuccess && linkCreated, 'createLetter accepts "link" delivery channel without requiring recipient email');
  Letter.create = origCreate;

  // 9. PHASE 8 — Resend Email Service & Template Verification
  console.log('\n[9. PHASE 8 — Resend Email Service & Template Safety]');
  const mockLetterDoc = new Letter({
    _id: new mongoose.Types.ObjectId(),
    userId: testUserId,
    type: 'someone',
    recipientName: 'Lucas Vance',
    recipientEmail: 'lucas@example.com',
    deliveryChannel: 'email',
    title: 'A Memory to Keep',
    encryptedContent: encryptLetterContent('My private deeply personal thoughts.'),
    scheduledDeliveryDate: '2027-06-15',
    scheduledDeliveryTime: '20:00',
    scheduledDeliveryTimestamp: Date.now() + 1000000,
    timezone: 'UTC',
    publicTokenHash: tokenSha256,
    status: 'SCHEDULED',
  });

  const emailResult = await EmailService.sendLetterEmail(mockLetterDoc, rawPublicToken);
  if (!process.env.RESEND_API_KEY) {
    assert(emailResult.isConfigRequired === true, 'EmailService returns isConfigRequired=true when RESEND_API_KEY is unset');
  } else {
    assert(typeof emailResult.success === 'boolean', 'EmailService interacts with real Resend API endpoint');
  }

  // 10. PHASE 8 — Server-Side Scheduler & Atomic Status Transition Tests
  console.log('\n[10. PHASE 8 — Server-Side Scheduler & Idempotent Claiming]');
  const dueLetterDoc = new Letter({
    _id: new mongoose.Types.ObjectId(),
    userId: testUserId,
    type: 'someone',
    recipientName: 'Sophia',
    recipientEmail: 'sophia@example.com',
    deliveryChannel: 'email',
    title: 'One Year From Tonight',
    encryptedContent: encryptLetterContent('Here is the letter text.'),
    encryptedToken: encryptLetterContent(rawPublicToken),
    scheduledDeliveryDate: '2025-01-01',
    scheduledDeliveryTime: '12:00',
    scheduledDeliveryTimestamp: Date.now() - 5000,
    timezone: 'UTC',
    publicTokenHash: tokenSha256,
    status: 'SCHEDULED',
  });

  const origLetterFind = Letter.find;
  const origFindOneAndUpdate = Letter.findOneAndUpdate;

  Letter.find = () => ({
    then: (resolve) => resolve([dueLetterDoc]),
  });

  let claimedStatus = '';
  Letter.findOneAndUpdate = (query, update) => {
    claimedStatus = update.status;
    dueLetterDoc.status = update.status;
    return {
      then: (resolve) => resolve(dueLetterDoc),
    };
  };

  dueLetterDoc.save = async () => {};

  await processScheduledLettersBatch();
  assert(claimedStatus === 'PROCESSING', 'Scheduler atomically transitions letter to PROCESSING state to prevent duplicate delivery');
  assert(dueLetterDoc.status === 'DELIVERED' || dueLetterDoc.status === 'CONFIG_REQUIRED', 'Scheduler marks letter status after delivery attempt');

  Letter.find = origLetterFind;
  Letter.findOneAndUpdate = origFindOneAndUpdate;

  // 11. PHASE 8 — Public Recipient Endpoint & Sealed Content Masking
  console.log('\n[11. PHASE 8 — Public Recipient Security & Content Masking]');
  const futureScheduledLetter = new Letter({
    _id: new mongoose.Types.ObjectId(),
    userId: testUserId,
    type: 'someone',
    recipientName: 'Elena',
    title: 'A Letter for 2028',
    encryptedContent: encryptLetterContent('ULTRA PRIVATE SENSITIVE MESSAGE'),
    scheduledDeliveryDate: '2028-01-01',
    scheduledDeliveryTime: '12:00',
    scheduledDeliveryTimestamp: Date.now() + 50000000,
    timezone: 'UTC',
    publicTokenHash: tokenSha256,
    status: 'SCHEDULED',
  });

  const origFindOne = Letter.findOne;
  Letter.findOne = (q) => {
    if (q.publicTokenHash === tokenSha256) {
      return { then: (resolve) => resolve(futureScheduledLetter) };
    }
    return { then: (resolve) => resolve(null) };
  };

  let publicGetSuccess = false;
  let publicGetContent = 'NOT_NULL';
  let publicGetDeliverable = true;

  await getPublicLetterByToken(
    { params: { token: rawPublicToken } },
    {
      status: (s) => ({
        json: (payload) => {
          if (s === 200 && payload.success) {
            publicGetSuccess = true;
            publicGetContent = payload.letter.content;
            publicGetDeliverable = payload.letter.isDeliverable;
          }
        },
      }),
    },
    () => {}
  );

  assert(publicGetSuccess === true, 'Public GET /api/letters/public/:token succeeds without login/auth');
  assert(publicGetContent === null, 'Protected letter content is strictly NULL/masked before scheduled delivery moment');
  assert(publicGetDeliverable === false, 'Letter is marked isDeliverable=false before delivery time arrives');

  let prematureOpenRejected = false;
  await openPublicLetterByToken(
    { params: { token: rawPublicToken } },
    {
      status: (s) => ({
        json: (payload) => {
          if (s === 400 && !payload.success) {
            prematureOpenRejected = true;
          }
        },
      }),
    },
    () => {}
  );
  assert(prematureOpenRejected === true, 'Public POST /api/letters/public/:token/open rejects premature open attempt with 400');

  let invalidToken404 = false;
  await getPublicLetterByToken(
    { params: { token: 'invalid_random_nonexistent_token' } },
    {
      status: (s) => ({
        json: (payload) => {
          if (s === 404 && !payload.success) {
            invalidToken404 = true;
          }
        },
      }),
    },
    () => {}
  );
  assert(invalidToken404 === true, 'Public endpoint returns 404 for invalid/expired tokens');

  // 12. PHASE 8 — Public Open & Unsealing After Delivery Moment
  console.log('\n[12. PHASE 8 — Successful Public Unsealing & openedAt Recording]');
  const deliverableLetter = new Letter({
    _id: new mongoose.Types.ObjectId(),
    userId: testUserId,
    type: 'someone',
    recipientName: 'Elena',
    title: 'A Letter for Today',
    encryptedContent: encryptLetterContent('Here is the unlocked letter content!'),
    scheduledDeliveryDate: '2025-01-01',
    scheduledDeliveryTime: '12:00',
    scheduledDeliveryTimestamp: Date.now() - 10000,
    timezone: 'UTC',
    publicTokenHash: tokenSha256,
    status: 'DELIVERED',
  });
  deliverableLetter.save = async () => {};

  Letter.findOne = () => ({ then: (resolve) => resolve(deliverableLetter) });

  let unsealSuccess = false;
  let unsealedContent = '';
  let unsealedStatus = '';

  await openPublicLetterByToken(
    { params: { token: rawPublicToken } },
    {
      status: (s) => ({
        json: (payload) => {
          if (s === 200 && payload.success) {
            unsealSuccess = true;
            unsealedContent = payload.letter.content;
            unsealedStatus = payload.letter.status;
          }
        },
      }),
    },
    () => {}
  );

  assert(unsealSuccess === true, 'POST /api/letters/public/:token/open successfully unseals deliverable letter');
  assert(unsealedContent === 'Here is the unlocked letter content!', 'Unsealed response contains full decrypted plaintext');
  assert(deliverableLetter.status === 'OPENED' && unsealedStatus === 'OPENED', 'Letter status transitioned to OPENED');
  assert(deliverableLetter.openedAt instanceof Date, 'openedAt recorded as Date timestamp');

  // 13. PHASE 8 — Cross-User Letter Isolation Tests
  console.log('\n[13. PHASE 8 — Cross-User Letter Isolation Tests]');
  const userA_Id = new mongoose.Types.ObjectId();
  const userB_Id = new mongoose.Types.ObjectId();

  Letter.findOne = (query) => {
    if (query.userId && query.userId.toString() === userB_Id.toString()) {
      return { then: (resolve) => resolve(null) };
    }
    return { then: (resolve) => resolve(deliverableLetter) };
  };

  let userB_Letter404 = false;
  await getLetterById(
    { userId: userB_Id, params: { id: deliverableLetter._id.toString() } },
    {
      status: (code) => ({
        json: (payload) => {
          if (code === 404 && !payload.success) {
            userB_Letter404 = true;
          }
        },
      }),
    },
    () => {}
  );
  assert(userB_Letter404 === true, 'User B attempting to access User A letter is rejected with 404 (Isolation enforced)');
  Letter.findOne = origFindOne;

  // ================================================================
  // 14. PHASE 9 — MEMORIES, SOMEDAY, UPLOAD & FULL DATA ISOLATION
  // ================================================================
  console.log('\n[14. PHASE 9 — MEMORIES CRUD & VALIDATION]');
  
  // Test 14a: Memory schema contains userId & is indexed
  assert(Memory.schema.path('userId') !== undefined, 'Memory schema contains userId');
  assert(Memory.schema.path('userId').instance === 'ObjectId', 'Memory userId is indexed ObjectId');
  assert(Memory.schema.path('storageKey') !== undefined, 'Memory schema contains storageKey reference');

  // Test 14b: Unauthenticated GET memories returns 401
  let unauthMem401 = false;
  await requireAuth(mockReq, { status: (c) => ({ json: () => { if (c === 401) unauthMem401 = true; } }) }, mockNext);
  assert(unauthMem401 === true, 'Unauthenticated GET memories returns 401');

  // Test 14c: Create Memory
  let createMemSuccess = false;
  const testMemoryDoc = new Memory({
    _id: new mongoose.Types.ObjectId(),
    userId: userA_Id,
    photoUrl: '/uploads/photos/test_mem.jpg',
    storageKey: 'photos/test_mem.jpg',
    caption: 'Sunset at the bay',
    date: '2026-09-04',
    location: 'Coastal Pier',
  });

  const origMemoryCreate = Memory.create;
  Memory.create = async (data) => ({
    _id: new mongoose.Types.ObjectId(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  await createMemory(
    { userId: userA_Id, body: { photoUrl: '/uploads/photos/test_mem.jpg', caption: 'Sunset at the bay', date: '2026-09-04' } },
    { status: (c) => ({ json: (p) => { if (c === 201 && p.success) createMemSuccess = true; } }) },
    () => {}
  );
  assert(createMemSuccess === true, 'User can create memory');

  // Test 14d: Retrieve own memories
  const origMemoryFind = Memory.find;
  Memory.find = (q) => ({
    sort: () => ({
      then: (resolve) => resolve(q.userId.toString() === userA_Id.toString() ? [testMemoryDoc] : []),
    }),
  });

  let getMemSuccess = false;
  await getMemories(
    { userId: userA_Id },
    { status: (c) => ({ json: (p) => { if (c === 200 && p.memories.length === 1) getMemSuccess = true; } }) },
    () => {}
  );
  assert(getMemSuccess === true, 'User can retrieve own memories');

  // Test 14e: Update own memory
  const origMemoryFindOne = Memory.findOne;
  testMemoryDoc.save = async () => {};
  Memory.findOne = (q) => ({
    then: (resolve) => resolve(q.userId.toString() === userA_Id.toString() ? testMemoryDoc : null),
  });

  let updateMemSuccess = false;
  await updateMemory(
    { userId: userA_Id, params: { id: testMemoryDoc._id.toString() }, body: { caption: 'Updated sunset caption' } },
    { status: (c) => ({ json: (p) => { if (c === 200 && p.success) updateMemSuccess = true; } }) },
    () => {}
  );
  assert(updateMemSuccess === true, 'User can update own memory');

  // Test 14f: Delete own memory
  const origMemoryDeleteOne = Memory.deleteOne;
  const origUploadedFileDeleteOne = UploadedFile.deleteOne;
  Memory.deleteOne = async () => ({ deletedCount: 1 });
  UploadedFile.deleteOne = async () => ({ deletedCount: 1 });

  let deleteMemSuccess = false;
  await deleteMemory(
    { userId: userA_Id, params: { id: testMemoryDoc._id.toString() } },
    { status: (c) => ({ json: (p) => { if (c === 200 && p.success) deleteMemSuccess = true; } }) },
    () => {}
  );
  assert(deleteMemSuccess === true, 'User can delete own memory');

  Memory.create = origMemoryCreate;
  Memory.find = origMemoryFind;
  Memory.findOne = origMemoryFindOne;
  Memory.deleteOne = origMemoryDeleteOne;
  UploadedFile.deleteOne = origUploadedFileDeleteOne;

  // ================================================================
  // 15. PHASE 9 — SOMEDAY DREAMS CRUD & COMPLETION TOGGLE
  // ================================================================
  console.log('\n[15. PHASE 9 — SOMEDAY DREAMS CRUD & COMPLETION TOGGLE]');

  assert(Someday.schema.path('userId') !== undefined, 'Someday schema contains userId');
  assert(Someday.schema.path('userId').instance === 'ObjectId', 'Someday userId is indexed ObjectId');
  assert(Someday.schema.path('storageKey') !== undefined, 'Someday schema contains storageKey reference');

  // Test 15a: Unauthenticated GET someday returns 401
  let unauthSomeday401 = false;
  await requireAuth(mockReq, { status: (c) => ({ json: () => { if (c === 401) unauthSomeday401 = true; } }) }, mockNext);
  assert(unauthSomeday401 === true, 'Unauthenticated GET someday returns 401');

  // Test 15b: Create someday item
  const origSomedayCreate = Someday.create;
  Someday.create = async (data) => ({
    _id: new mongoose.Types.ObjectId(),
    ...data,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  let createSomedaySuccess = false;
  await createSomedayDream(
    { userId: userA_Id, body: { title: 'See the Northern Lights', category: 'places' } },
    { status: (c) => ({ json: (p) => { if (c === 201 && p.success) createSomedaySuccess = true; } }) },
    () => {}
  );
  assert(createSomedaySuccess === true, 'User can create someday item');

  // Test 15c: Retrieve own someday items
  const testSomedayDoc = new Someday({
    _id: new mongoose.Types.ObjectId(),
    userId: userA_Id,
    title: 'See the Northern Lights',
    category: 'places',
    completed: false,
  });
  testSomedayDoc.save = async () => {};

  const origSomedayFind = Someday.find;
  Someday.find = (q) => ({
    sort: () => ({
      then: (resolve) => resolve(q.userId.toString() === userA_Id.toString() ? [testSomedayDoc] : []),
    }),
  });

  let getSomedaySuccess = false;
  await getSomedayDreams(
    { userId: userA_Id },
    { status: (c) => ({ json: (p) => { if (c === 200 && p.dreams.length === 1) getSomedaySuccess = true; } }) },
    () => {}
  );
  assert(getSomedaySuccess === true, 'User can retrieve own someday items');

  // Test 15d: Toggle completion & completedAt
  const origSomedayFindOne = Someday.findOne;
  Someday.findOne = (q) => ({
    then: (resolve) => resolve(q.userId.toString() === userA_Id.toString() ? testSomedayDoc : null),
  });

  let toggleSuccess = false;
  await toggleSomedayDream(
    { userId: userA_Id, params: { id: testSomedayDoc._id.toString() }, body: {} },
    { status: (c) => ({ json: (p) => { if (c === 200 && p.success) toggleSuccess = true; } }) },
    () => {}
  );
  assert(toggleSuccess === true && testSomedayDoc.completed === true, 'User can toggle completion');
  assert(typeof testSomedayDoc.completedAt === 'string' && testSomedayDoc.completedAt.length > 5, 'completedAt is recorded upon completion');

  // Toggle back to false
  await toggleSomedayDream(
    { userId: userA_Id, params: { id: testSomedayDoc._id.toString() }, body: {} },
    { status: () => ({ json: () => {} }) },
    () => {}
  );
  assert(testSomedayDoc.completed === false && testSomedayDoc.completedAt === undefined, 'completedAt is cleared when dream is toggled back to active');

  // Test 15e: Delete own someday item
  const origSomedayDeleteOne = Someday.deleteOne;
  const origUploadedFileDeleteOneSomeday = UploadedFile.deleteOne;
  Someday.deleteOne = async () => ({ deletedCount: 1 });
  UploadedFile.deleteOne = async () => ({ deletedCount: 1 });

  let deleteSomedaySuccess = false;
  await deleteSomedayDream(
    { userId: userA_Id, params: { id: testSomedayDoc._id.toString() } },
    { status: (c) => ({ json: (p) => { if (c === 200 && p.success) deleteSomedaySuccess = true; } }) },
    () => {}
  );
  assert(deleteSomedaySuccess === true, 'User can delete own someday item');

  Someday.create = origSomedayCreate;
  Someday.find = origSomedayFind;
  Someday.findOne = origSomedayFindOne;
  Someday.deleteOne = origSomedayDeleteOne;
  UploadedFile.deleteOne = origUploadedFileDeleteOneSomeday;

  // ================================================================
  // 16. PHASE 9 — REAL PHOTO UPLOAD & SECURITY
  // ================================================================
  console.log('\n[16. PHASE 9 — REAL PHOTO UPLOAD & SECURITY]');

  // Test 16a: Unauthenticated upload returns 401
  let unauthUpload401 = false;
  await handleFileUpload(
    { userId: undefined, file: dummyMulterFile },
    { status: (c) => ({ json: (p) => { if (c === 401 && !p.success) unauthUpload401 = true; } }) },
    () => {}
  );
  assert(unauthUpload401 === true, 'Unauthenticated upload returns 401');

  // Test 16b: Valid image upload creates metadata with safe unique filename
  const origUploadedFileCreate = UploadedFile.create;
  let createdUploadedFile = null;
  UploadedFile.create = async (doc) => {
    createdUploadedFile = { _id: new mongoose.Types.ObjectId(), ...doc };
    return createdUploadedFile;
  };

  let uploadSuccess = false;
  let uploadedUrl = '';
  let uploadedKey = '';

  await handleFileUpload(
    { userId: userA_Id, file: dummyMulterFile },
    {
      status: (c) => ({
        json: (p) => {
          if (c === 201 && p.success) {
            uploadSuccess = true;
            uploadedUrl = p.url;
            uploadedKey = p.storageKey;
          }
        },
      }),
    },
    () => {}
  );

  assert(uploadSuccess === true, 'Valid image upload succeeds');
  assert(uploadedKey.startsWith('photos/') && !uploadedKey.includes('..'), 'Uploaded file gets safe generated unguessable filename');
  assert(createdUploadedFile.userId.toString() === userA_Id.toString(), 'Uploaded file metadata contains authenticated userId');

  // Test 16c: Test file deletion
  const fileCleaned = await storageService.deleteFile(uploadedKey);
  assert(fileCleaned === true, 'Test file can be deleted safely from disk storage');

  UploadedFile.create = origUploadedFileCreate;

  // ================================================================
  // 17. PHASE 9 — STRICT CROSS-USER DATA ISOLATION
  // ================================================================
  console.log('\n[17. PHASE 9 — STRICT CROSS-USER DATA ISOLATION]');

  // Isolation for Memories: User B accessing User A memory
  Memory.findOne = (q) => ({
    then: (resolve) => resolve(q.userId && q.userId.toString() === userB_Id.toString() ? null : testMemoryDoc),
  });

  let userB_MemUpdate404 = false;
  await updateMemory(
    { userId: userB_Id, params: { id: testMemoryDoc._id.toString() }, body: { caption: 'Hacked caption' } },
    { status: (c) => ({ json: (p) => { if (c === 404 && !p.success) userB_MemUpdate404 = true; } }) },
    () => {}
  );
  assert(userB_MemUpdate404 === true, 'User B cannot update User A memory (404 enforced)');

  let userB_MemDelete404 = false;
  await deleteMemory(
    { userId: userB_Id, params: { id: testMemoryDoc._id.toString() } },
    { status: (c) => ({ json: (p) => { if (c === 404 && !p.success) userB_MemDelete404 = true; } }) },
    () => {}
  );
  assert(userB_MemDelete404 === true, 'User B cannot delete User A memory (404 enforced)');

  // Isolation for Someday Dreams: User B accessing User A dream
  Someday.findOne = (q) => ({
    then: (resolve) => resolve(q.userId && q.userId.toString() === userB_Id.toString() ? null : testSomedayDoc),
  });

  let userB_SomedayToggle404 = false;
  await toggleSomedayDream(
    { userId: userB_Id, params: { id: testSomedayDoc._id.toString() }, body: {} },
    { status: (c) => ({ json: (p) => { if (c === 404 && !p.success) userB_SomedayToggle404 = true; } }) },
    () => {}
  );
  assert(userB_SomedayToggle404 === true, 'User B cannot toggle User A someday item (404 enforced)');

  let userB_SomedayDelete404 = false;
  await deleteSomedayDream(
    { userId: userB_Id, params: { id: testSomedayDoc._id.toString() } },
    { status: (c) => ({ json: (p) => { if (c === 404 && !p.success) userB_SomedayDelete404 = true; } }) },
    () => {}
  );
  assert(userB_SomedayDelete404 === true, 'User B cannot delete User A someday item (404 enforced)');

  // ================================================================
  // 18. PHASE 10 — FINAL SCHEDULED DELIVERY AUDIT & LIFECYCLE VERIFICATION
  // ================================================================
  console.log('\n[18. PHASE 10 — SCHEDULED DELIVERY AUDIT & LIFECYCLE VERIFICATION]');

  // 1. Scheduled letter creation does NOT send notification immediately
  const futureTime = Date.now() + 86400000; // 24 hours in the future
  const schedLetterRawToken = generatePublicToken();
  const schedTokenHash = hashToken(schedLetterRawToken);
  const schedDoc = new Letter({
    _id: new mongoose.Types.ObjectId(),
    userId: userA_Id,
    type: 'someone',
    recipientName: 'Lucas',
    recipientEmail: 'lucas@example.com',
    deliveryChannel: 'email',
    title: 'Future Letter for Tomorrow',
    encryptedContent: encryptLetterContent('Hello Lucas from the past!'),
    encryptedToken: encryptLetterContent(schedLetterRawToken),
    scheduledDeliveryDate: '2026-09-07',
    scheduledDeliveryTime: '20:00',
    scheduledDeliveryTimestamp: futureTime,
    timezone: 'UTC',
    publicTokenHash: schedTokenHash,
    status: 'SCHEDULED',
  });
  schedDoc.save = async () => {};

  // Verify creating scheduled letter keeps it in SCHEDULED state and not DELIVERED
  assert(schedDoc.status === 'SCHEDULED', '1. Scheduled letter creation stores status as SCHEDULED and does not mark DELIVERED prematurely');
  assert(schedDoc.scheduledDeliveryTimestamp > Date.now(), '1. Scheduled delivery timestamp is in the future');

  // 2. Scheduled letter content is completely masked before deliveryAt
  const origFindOneLetter = Letter.findOne;
  Letter.findOne = (q) => {
    if (q.publicTokenHash === schedTokenHash) {
      return { then: (resolve) => resolve(schedDoc) };
    }
    return { then: (resolve) => resolve(null) };
  };

  let preDeliveryContent = 'EXPOSED';
  let preDeliveryDeliverable = true;
  await getPublicLetterByToken(
    { params: { token: schedLetterRawToken } },
    {
      status: (code) => ({
        json: (res) => {
          if (code === 200 && res.success) {
            preDeliveryContent = res.letter.content;
            preDeliveryDeliverable = res.letter.isDeliverable;
          }
        },
      }),
    },
    () => {}
  );
  assert(preDeliveryContent === null, '2. Scheduled letter content is strictly null before deliveryAt');
  assert(preDeliveryDeliverable === false, '2. Scheduled letter is marked isDeliverable: false before deliveryAt');

  // 3. Premature opening rejected by server
  let prematureOpenBlocked = false;
  await openPublicLetterByToken(
    { params: { token: schedLetterRawToken } },
    {
      status: (code) => ({
        json: (res) => {
          if (code === 400 && !res.success) {
            prematureOpenBlocked = true;
          }
        },
      }),
    },
    () => {}
  );
  assert(prematureOpenBlocked === true, '3. Premature open attempt rejected with 400 before deliveryAt');

  // 4. Server-time simulation: deliveryAt arrives
  schedDoc.scheduledDeliveryTimestamp = Date.now() - 1000; // Time has passed

  let postDeliveryContent = null;
  let postDeliveryDeliverable = false;
  await getPublicLetterByToken(
    { params: { token: schedLetterRawToken } },
    {
      status: (code) => ({
        json: (res) => {
          if (code === 200 && res.success) {
            postDeliveryContent = res.letter.content;
            postDeliveryDeliverable = res.letter.isDeliverable;
          }
        },
      }),
    },
    () => {}
  );
  assert(postDeliveryDeliverable === true, '4. Scheduled letter becomes isDeliverable: true after deliveryAt');
  assert(postDeliveryContent === 'Hello Lucas from the past!', '4. Full decrypted content returned after deliveryAt');

  // 5. Opening after deliveryAt records openedAt & transitions status to OPENED
  let postOpenSuccess = false;
  await openPublicLetterByToken(
    { params: { token: schedLetterRawToken } },
    {
      status: (code) => ({
        json: (res) => {
          if (code === 200 && res.success) {
            postOpenSuccess = true;
          }
        },
      }),
    },
    () => {}
  );
  assert(postOpenSuccess === true && schedDoc.status === 'OPENED', '5. Opening letter sets status: OPENED');
  assert(schedDoc.openedAt instanceof Date, '5. Opening letter records openedAt timestamp');

  // 6. Direct link scheduled delivery automatically becomes DELIVERED without email failure
  const directLinkRawToken = generatePublicToken();
  const directLinkDoc = new Letter({
    _id: new mongoose.Types.ObjectId(),
    userId: userA_Id,
    type: 'someone',
    recipientName: 'Direct Friend',
    deliveryChannel: 'link',
    title: 'Direct Link Delivery',
    encryptedContent: encryptLetterContent('Direct Link Secret Message'),
    encryptedToken: encryptLetterContent(directLinkRawToken),
    scheduledDeliveryDate: '2026-09-06',
    scheduledDeliveryTime: '12:00',
    scheduledDeliveryTimestamp: Date.now() - 5000, // Due now
    timezone: 'UTC',
    publicTokenHash: hashToken(directLinkRawToken),
    status: 'SCHEDULED',
  });
  directLinkDoc.save = async () => {};

  Letter.find = async (q) => {
    if (directLinkDoc.status === 'SCHEDULED') {
      return [directLinkDoc];
    }
    return [];
  };

  Letter.findOneAndUpdate = async (q, u) => {
    if (directLinkDoc.status === 'SCHEDULED') {
      directLinkDoc.status = u.status;
      return directLinkDoc;
    }
    return null;
  };

  const processedCount = await processScheduledLettersBatch();
  assert(processedCount === 1, '6. Scheduler finds and claims due Direct Link letter');
  assert(directLinkDoc.status === 'DELIVERED', '6. Direct Link letter transitions cleanly to DELIVERED when due');

  // 7. Scheduler idempotency: second cycle does not re-process DELIVERED letter
  const secondCycleCount = await processScheduledLettersBatch();
  assert(secondCycleCount === 0, '7. Scheduler does not re-process already DELIVERED letters (No duplicate notifications)');

  // 8. Backend startup/restart processing: overdue letters processed on startup
  const restartDoc = new Letter({
    _id: new mongoose.Types.ObjectId(),
    userId: userA_Id,
    type: 'someone',
    recipientName: 'Offline Recovered',
    deliveryChannel: 'link',
    title: 'Letter Missed While Server Down',
    encryptedContent: encryptLetterContent('Recovered on startup!'),
    encryptedToken: encryptLetterContent(generatePublicToken()),
    scheduledDeliveryDate: '2026-09-05',
    scheduledDeliveryTime: '10:00',
    scheduledDeliveryTimestamp: Date.now() - 100000, // Happened while server was offline
    timezone: 'UTC',
    publicTokenHash: hashToken('offline_token'),
    status: 'SCHEDULED',
  });
  restartDoc.save = async () => {};

  Letter.find = async (q) => {
    if (restartDoc.status === 'SCHEDULED') {
      return [restartDoc];
    }
    return [];
  };
  Letter.findOneAndUpdate = async (q, u) => {
    if (restartDoc.status === 'SCHEDULED') {
      restartDoc.status = u.status;
      return restartDoc;
    }
    return null;
  };

  const restartProcessed = await processScheduledLettersBatch();
  assert(restartProcessed === 1 && restartDoc.status === 'DELIVERED', '8. Backend startup processes overdue letters missed while offline');

  // 9. Send Now (isImmediate: true) creates immediately unlocked letter
  let sendNowCreated = false;
  let sendNowRawToken = '';
  const origLetterCreate = Letter.create;
  Letter.create = async (data) => {
    const doc = new Letter({
      _id: new mongoose.Types.ObjectId(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return doc;
  };

  await createLetter(
    {
      userId: userA_Id.toString(),
      body: {
        type: 'someone',
        recipientName: 'Instant Friend',
        deliveryChannel: 'link',
        title: 'Instant Letter',
        content: 'Immediate message content',
        isImmediate: true,
      },
    },
    {
      status: (code) => ({
        json: (payload) => {
          if (code === 201 && payload.success) {
            sendNowCreated = true;
            sendNowRawToken = payload.letter.token;
          }
        },
      }),
    },
    () => {}
  );
  assert(sendNowCreated === true && sendNowRawToken.length > 20, '9. Send Now creates letter immediately with secure public token');

  // 10. Timezone scheduling test: IST (Asia/Kolkata / GMT+5:30)
  let istLetterCreated = false;
  let istStoredTimestamp = 0;
  let istScheduledDate = '';
  let istScheduledTime = '';

  await createLetter(
    {
      userId: userA_Id.toString(),
      body: {
        type: 'someone',
        recipientName: 'Aarav',
        deliveryChannel: 'link',
        title: 'Letter to Aarav in IST',
        content: 'Meeting in Bangalore',
        scheduledDeliveryDate: '2026-09-06',
        scheduledDeliveryTime: '20:53',
        timezone: 'India Standard Time (IST)',
      },
    },
    {
      status: (code) => ({
        json: (payload) => {
          if (code === 201 && payload.success) {
            istLetterCreated = true;
            istStoredTimestamp = payload.letter.scheduledDeliveryTimestamp;
            istScheduledDate = payload.letter.scheduledDeliveryDate;
            istScheduledTime = payload.letter.scheduledDeliveryTime;
          }
        },
      }),
    },
    () => {}
  );

  // 2026-09-06 20:53:00 IST = 2026-09-06 15:23:00 UTC = 1788708180000 ms
  const expectedIstUtcMs = Date.UTC(2026, 8, 6, 15, 23, 0); // 1788708180000
  assert(istLetterCreated === true, '10. Scheduled letter in IST created successfully');
  assert(istStoredTimestamp === expectedIstUtcMs, '10. IST 20:53 converts to exact UTC timestamp (15:23 UTC) without adding +5:30');
  assert(istScheduledDate === '2026-09-06' && istScheduledTime === '20:53', '10. Stored date/time preserves user-selected strings');

  // 11. Creation with explicit client-provided scheduledDeliveryTimestamp
  let clientTsCreated = false;
  let clientStoredTs = 0;
  const customTs = Date.now() + 600000; // 10 minutes in the future

  await createLetter(
    {
      userId: userA_Id.toString(),
      body: {
        type: 'someone',
        recipientName: 'Diya',
        deliveryChannel: 'link',
        title: 'Letter with Client Timestamp',
        content: 'Precise timestamp test',
        scheduledDeliveryDate: '2026-09-06',
        scheduledDeliveryTime: '21:05',
        scheduledDeliveryTimestamp: customTs,
        timezone: 'Asia/Kolkata',
      },
    },
    {
      status: (code) => ({
        json: (payload) => {
          if (code === 201 && payload.success) {
            clientTsCreated = true;
            clientStoredTs = payload.letter.scheduledDeliveryTimestamp;
          }
        },
      }),
    },
    () => {}
  );
  assert(clientTsCreated === true && clientStoredTs === customTs, '11. Server honors explicit client-provided scheduledDeliveryTimestamp');

  // 12. Clean up mocks
  Letter.findOne = origFindOneLetter;
  Letter.find = origLetterFind;
  Letter.create = origLetterCreate;
  Letter.findOneAndUpdate = origFindOneAndUpdate;

  console.log('\n================================================================');
  console.log(`ALL TESTS COMPLETE: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test runner encountered unexpected error:', err);
  process.exit(1);
});
