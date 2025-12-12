# Testing Plan

## AI Medical Voice Agent - Test Cases Documentation

---

## 1. Test Strategy Overview

| Type | Framework | Coverage Target |
|------|-----------|-----------------|
| Unit Tests | Jest + React Testing Library | 70% |
| Integration Tests | Jest | 60% |
| E2E Tests | Playwright (optional) | Critical paths |

---

## 2. Unit Test Cases

### 2.1 Authentication Module

| ID | Test Case | Input | Expected Output | Status |
|----|-----------|-------|-----------------|--------|
| AUTH-001 | Valid user registration | Valid email, password | User created, success response | ✅ |
| AUTH-002 | Duplicate email registration | Existing email | Error: "Email already exists" | ✅ |
| AUTH-003 | Invalid email format | "invalid-email" | Error: "Invalid email" | ✅ |
| AUTH-004 | Password too short | 5 char password | Error: "Min 8 characters" | ✅ |
| AUTH-005 | Valid login | Correct credentials | Session created | ✅ |
| AUTH-006 | Invalid login | Wrong password | Error: "Invalid credentials" | ✅ |
| AUTH-007 | Google OAuth login | Valid Google token | Session created | ✅ |

### 2.2 Chat API Module

| ID | Test Case | Input | Expected Output | Status |
|----|-----------|-------|-----------------|--------|
| CHAT-001 | Valid symptom message | "I have headache" | AI response with follow-up | ✅ |
| CHAT-002 | Empty message | "" | Error: "I didn't catch that" | ✅ |
| CHAT-003 | Pure greeting | "Hello" | Greeting response | ✅ |
| CHAT-004 | End conversation | "That's all" | Prescription prompt | ✅ |
| CHAT-005 | Specialist redirect | Eye symptom to general | Redirect to Eye Doctor | ✅ |
| CHAT-006 | Thank you message | "Thank you" | Closing response | ✅ |
| CHAT-007 | No session | No auth token | Error: "Please sign in" | ✅ |

### 2.3 Specialist Matching

| ID | Test Case | Input | Expected Specialist | Status |
|----|-----------|-------|---------------------|--------|
| SPEC-001 | Eye keywords | "vision problem" | eye | ✅ |
| SPEC-002 | Bone keywords | "back pain" | orthopedic | ✅ |
| SPEC-003 | Lung keywords | "can't breathe" | respiratory | ✅ |
| SPEC-004 | Stomach keywords | "stomach ache" | digestive | ✅ |
| SPEC-005 | General keywords | "fever" | general | ✅ |
| SPEC-006 | No match | "random text" | null | ✅ |

### 2.4 Greeting Detection

| ID | Test Case | Input | Is Greeting? | Status |
|----|-----------|-------|--------------|--------|
| GREET-001 | Pure hello | "hello" | true | ✅ |
| GREET-002 | Pure hi | "hi" | true | ✅ |
| GREET-003 | Hello with symptoms | "hello I have pain" | false | ✅ |
| GREET-004 | Hi doctor | "hi doctor" | true | ✅ |
| GREET-005 | Good morning | "good morning" | true | ✅ |
| GREET-006 | Normal message | "my eye hurts" | false | ✅ |

---

## 3. Integration Test Cases

### 3.1 Consultation Flow

| ID | Test Case | Steps | Expected Result | Status |
|----|-----------|-------|-----------------|--------|
| INT-001 | Complete consultation | Login → Select specialty → Chat → Get prescription | Report generated | ✅ |
| INT-002 | Specialist switch | Start general → Eye symptoms → Redirect | Redirect to Eye Doctor | ✅ |
| INT-003 | Save consultation | Complete consultation | Saved to database | ✅ |
| INT-004 | View history | Login → Go to history | Past consultations displayed | ✅ |

### 3.2 Voice Features

| ID | Test Case | Action | Expected Result | Status |
|----|-----------|--------|-----------------|--------|
| VOICE-001 | Start recording | Click mic | Listening state active | ✅ |
| VOICE-002 | Stop recording | Click mic again | Listening stops | ✅ |
| VOICE-003 | Auto-stop on silence | Stop speaking | Message sent after 1.5s | ✅ |
| VOICE-004 | Text fallback | Type and send | Message processed | ✅ |

---

## 4. API Endpoint Tests

### 4.1 POST /api/chat

```typescript
describe('POST /api/chat', () => {
  it('should return AI response for valid message', async () => {
    const response = await POST(mockRequest({
      message: 'I have a headache',
      specialty: 'general'
    }));
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBeDefined();
  });

  it('should return error for empty message', async () => {
    const response = await POST(mockRequest({
      message: '',
      specialty: 'general'
    }));
    expect(response.body.message).toBe("I didn't catch that. Please repeat.");
  });

  it('should detect specialist redirect', async () => {
    const response = await POST(mockRequest({
      message: 'my eyes are blurry',
      specialty: 'general'
    }));
    expect(response.body.redirect).toBe('eye');
  });
});
```

### 4.2 POST /api/auth/register

```typescript
describe('POST /api/auth/register', () => {
  it('should create new user', async () => {
    const response = await POST(mockRequest({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    }));
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('should reject duplicate email', async () => {
    const response = await POST(mockRequest({
      name: 'Test User',
      email: 'existing@example.com',
      password: 'password123'
    }));
    expect(response.status).toBe(400);
  });
});
```

---

## 5. Test Environment Setup

### 5.1 Required Dependencies

```json
{
  "devDependencies": {
    "@testing-library/jest-dom": "^6.0.0",
    "@testing-library/react": "^14.0.0",
    "@types/jest": "^29.0.0",
    "jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

### 5.2 Jest Configuration

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

---

## 6. Test Execution Commands

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- chat.test.ts

# Run in watch mode
npm test -- --watch
```

---

## 7. Coverage Report Target

| Module | Target | Current |
|--------|--------|---------|
| api/chat | 80% | - |
| api/auth | 75% | - |
| components | 70% | - |
| lib | 85% | - |
| **Overall** | **75%** | - |

---

## 8. Bug Tracking

| ID | Issue | Severity | Status | Resolution |
|----|-------|----------|--------|------------|
| BUG-001 | Word duplication in voice | High | Fixed | Use final results only |
| BUG-002 | Auto-listen stops | Medium | Fixed | Use useRef for state |
| BUG-003 | Gemini 404 error | High | Fixed | Update to new SDK |
| BUG-004 | AI keeps asking | Medium | Fixed | Add end detection |

---

## 9. Test Automation CI/CD

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm test -- --coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```
