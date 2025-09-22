# GitHub Actions Workflows

This document describes the GitHub Actions workflows configured for this repository.

## E2E Tests Workflow

[![E2E Tests](https://github.com/cipherdolls/webapp/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/cipherdolls/webapp/actions/workflows/e2e-tests.yml)

**File:** `.github/workflows/e2e-tests.yml`

**Triggers:**
- Pull requests to `main` or `develop` branches
- On PR opened, synchronized, or reopened

**What it does:**
1. **Setup Environment:**
   - Ubuntu latest runner
   - Node.js 20
   - NPM package caching
   - Playwright browser caching
   - Synpress cache management

2. **Test Execution (Matrix Strategy):**
   - **MetaMask Tests:** Runs all MetaMask-related E2E tests using Synpress
   - **Browser Compatibility:** Runs cross-browser compatibility tests

3. **Features:**
   - Parallel test execution for faster results
   - Automatic Synpress cache setup and validation
   - Development server startup and health checks
   - Comprehensive artifact collection
   - Test result summaries
   - Security and dependency checks

4. **Artifacts:**
   - Playwright HTML reports (30 days retention)
   - Test results and screenshots (7 days retention)
   - Videos for failed tests
   - Debug information

## Test Debug Workflow

[![Test Debug](https://github.com/cipherdolls/webapp/actions/workflows/test-debug.yml/badge.svg)](https://github.com/cipherdolls/webapp/actions/workflows/test-debug.yml)

**File:** `.github/workflows/test-debug.yml`

**Triggers:**
- Manual dispatch only (`workflow_dispatch`)

**Input Options:**
- `test_type`: Choose specific test suite to run
- `debug_mode`: Enable verbose debugging
- `clear_cache`: Force cache clearing before tests

**Use Cases:**
- Debugging test failures
- Testing specific scenarios
- Performance investigation
- Cache-related troubleshooting

## Configuration Details

### Performance Optimizations
- **Caching Strategy:**
  - NPM packages cached by `package-lock.json` hash
  - Playwright browsers cached separately
  - Synpress cache preserved between runs
  
- **Parallel Execution:**
  - Matrix strategy splits MetaMask and browser tests
  - Individual test suites run independently
  - Fail-fast disabled to see all results

### Timeout Settings
- **Main Workflow:** 30 minutes total
- **Debug Workflow:** 45 minutes total
- **Server Startup:** 60 seconds timeout
- **Individual Tests:** Configured per test suite

### Error Handling
- Comprehensive cleanup of processes
- Artifact collection even on failures
- Detailed error reporting
- Server health verification

### Security Features
- Dependency vulnerability scanning
- Sensitive file detection
- Audit level checks
- Safe environment handling

## Usage Tips

### For Developers
1. **Regular Development:**
   - All E2E tests run automatically on PRs
   - Check the Actions tab for test results
   - Download artifacts for detailed analysis

2. **Debugging Issues:**
   - Use the debug workflow for targeted testing
   - Enable debug mode for verbose output
   - Clear caches if experiencing cache corruption

3. **Adding New Tests:**
   - Place tests in `testing/tests/` directory
   - Follow existing naming conventions
   - Update test scripts in `package.json` if needed

### For Reviewers
1. **PR Review Process:**
   - Wait for all E2E tests to pass
   - Review test summary in PR comments
   - Check artifacts if tests fail

2. **Test Failure Investigation:**
   - Download Playwright reports
   - Review screenshots and videos
   - Use debug workflow for reproduction

## Maintenance

### Dependencies
- Dependabot configured for weekly updates
- Grouped updates for related packages
- Automatic security updates enabled

### Monitoring
- Test result summaries generated automatically
- Artifacts retained for investigation
- Performance metrics tracked

### Troubleshooting

**Common Issues:**
1. **Cache Corruption:** Use debug workflow with cache clearing
2. **Server Startup Failures:** Check port conflicts and dependencies
3. **MetaMask Extension Issues:** Verify Synpress version compatibility
4. **Timeout Issues:** Review test complexity and server performance

**Getting Help:**
- Check workflow logs in GitHub Actions tab
- Download debug artifacts for detailed analysis
- Review test documentation in `testing/docs/`
- Use manual debug workflow for reproduction