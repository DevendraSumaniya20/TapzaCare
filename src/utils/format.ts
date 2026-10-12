/** 1499 -> "₹1,499", with Indian digit grouping. */
export const formatInr = (amount: number) =>
  `₹${amount.toLocaleString('en-IN')}`;
