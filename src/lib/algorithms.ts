export interface AlgorithmicPost {
  id: string;
  createdAt: Date;
  votes: { type: string }[];
}

/**
 * Computes official industry log-decay scores for a post record layout.
 */
export function calculateHotScore(post: AlgorithmicPost): number {
  const upvotes = post.votes.filter((v) => v.type === "UP").length;
  const downvotes = post.votes.filter((v) => v.type === "DOWN").length;
  const score = upvotes - downvotes;

  // Logarithmic reward scaling mapping
  const order = Math.log10(Math.max(Math.abs(score), 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;

  // Exponential time decay calculation step (relative to an epoch threshold baseline)
  const epochSeconds = Math.floor(post.createdAt.getTime() / 1000);
  const baselineEpoch = 1700000000; // Fixed static reference checkpoint
  const secondsAge = epochSeconds - baselineEpoch;

  // Decay factor: Every 12.5 hours requires double the net upvotes to maintain rank
  return sign * order + secondsAge / 45000;
}

/**
 * Computes conversational variance scores to rank controversial items.
 */
export function calculateControversialScore(post: AlgorithmicPost): number {
  const upvotes = post.votes.filter((v) => v.type === "UP").length;
  const downvotes = post.votes.filter((v) => v.type === "DOWN").length;

  if (upvotes === 0 && downvotes === 0) return 0;

  const totalVotes = upvotes + downvotes;
  const balanceDifference = Math.abs(upvotes - downvotes);

  // High total counts paired with very low differences result in maximum weights
  return totalVotes / (balanceDifference + 1);
}
