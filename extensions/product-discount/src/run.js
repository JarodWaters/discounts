// @ts-check
import { DiscountApplicationStrategy } from "../generated/api";

/**
 * @typedef {import("../generated/api").RunInput} RunInput
 * @typedef {import("../generated/api").FunctionRunResult} FunctionRunResult
 */

/**
 * @type {FunctionRunResult}
 */
const EMPTY_DISCOUNT = {
  discountApplicationStrategy: DiscountApplicationStrategy.First,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  console.log("Input Cart Lines:", JSON.stringify(input.cart.lines, null, 2));

  const cartTotal = parseFloat(input.cart.cost.subtotalAmount.amount);
  console.log("Cart Total:", cartTotal);

  const tiers = [
    { amount: 100, key: "tier1", message: "Spend $100 or more and get a free Tier 1 Product!" },
    { amount: 200, key: "tier2", message: "Spend $200 or more and get a free Tier 2 Product!" },
    { amount: 300, key: "tier3", message: "Spend $300 or more and get a free Tier 3 Product!" },
  ];

  const eligibleTiers = tiers.filter(tier => cartTotal >= tier.amount);

  console.log("Eligible Tiers:", eligibleTiers);

  if (eligibleTiers.length === 0) {
    console.error("No tiers are eligible for discount based on cart total.");
    return EMPTY_DISCOUNT;
  }

  const discounts = eligibleTiers.map(tier => {
    const targets = input.cart.lines
      .filter(line => line.merchandise.__typename === "ProductVariant")
      .map(line => ({
        productVariant: {
          id: line.merchandise.id,
        },
      }));

    return {
      message: tier.message,
      targets,
      value: {
        percentage: {
          value: "100.0",
        },
      },
    };
  });

  console.log("Discounts:", discounts);

  if (discounts.length === 0) {
    console.error("No cart lines qualify for the discount.");
    return EMPTY_DISCOUNT;
  }

  return {
    discounts,
    discountApplicationStrategy: DiscountApplicationStrategy.First,
  };
}
