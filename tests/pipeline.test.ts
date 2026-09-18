/**
 * CLI Test Runner for Open Source Security Transition Monitor
 * Executed via `npm test` or `tsx tests/pipeline.test.ts`
 */

import { runSuite } from './testRunner.ts';

async function main() {
  console.log('====================================================');
  console.log('OPEN SOURCE SECURITY TRANSITION MONITOR - TEST SUITE');
  console.log('Automated Behavioral Verification (Mock Fixtures)');
  console.log('====================================================\n');

  try {
    const summary = await runSuite();

    summary.tests.forEach((test, idx) => {
      const statusIcon = test.passed ? '✓ PASS' : '✗ FAIL';
      console.log(`[${statusIcon}] #${idx + 1} [${test.category}] ${test.name} (${test.durationMs}ms)`);
      if (!test.passed) {
        console.error(`       Error: ${test.message}`);
      }
    });

    console.log('\n----------------------------------------------------');
    console.log(`Summary: ${summary.passed}/${summary.total} tests passed (${summary.durationMs}ms)`);
    console.log('----------------------------------------------------');

    if (summary.failed > 0) {
      process.exit(1);
    } else {
      console.log('All pipeline verification assertions completed successfully.\n');
      process.exit(0);
    }
  } catch (err) {
    console.error('Test execution failed with fatal exception:', err);
    process.exit(1);
  }
}

main();
