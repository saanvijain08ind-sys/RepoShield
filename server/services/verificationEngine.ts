/**
 * Trust, Safety & Digital Security - Claim Verification Engine
 * PRISM Verification Engine Router & Dispatcher
 */

export { ClaimVerificationEngineV1 } from './verificationEngineV1.ts';
export { ClaimVerificationEngineV2 } from './verificationEngineV2.ts';
export { ReliabilityBenchmarkService } from './reliabilityBenchmark.ts';

import { ClaimVerificationEngineV2 } from './verificationEngineV2.ts';

// Default engine is V2 (production verified)
export const ClaimVerificationEngine = ClaimVerificationEngineV2;
