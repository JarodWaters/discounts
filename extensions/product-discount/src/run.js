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
  discountApplicationStrategy: DiscountApplicationStrategy.All,
  discounts: [],
};

/**
 * @param {RunInput} input
 * @returns {FunctionRunResult}
 */
export function run(input) {
  console.log("Input Cart Lines:", JSON.stringify(input.cart.lines, null, 2));

  const cartTotal = parseFloat(input.cart.cost.totalAmount.amount);
  console.log("Cart Total:", cartTotal);

  const tiers = [
    { amount: 0, key: "tier1", message: "Get a free Tier 1 Product with any order!" },
    { amount: 250, key: "tier2", message: "Spend $250 or more and get a free Tier 2 Product!" },
    { amount: 750, key: "tier3", message: "Spend $750 or more and get a free Tier 3 Product!" },
    { amount: 2500, key: "tier4", message: "Spend $2500 or more and get a free Tier 4 Product!" },
    { amount: 4000, key: "tier5", message: "Spend $4000 or more and get a free Tier 5 Product!" },
  ];

  const eligibleTiers = tiers.filter(tier => cartTotal >= tier.amount);
  console.log("Eligible Tiers:", JSON.stringify(eligibleTiers, null, 2));

  if (eligibleTiers.length === 0) {
    console.error("No tiers are eligible for discount based on cart total.");
    return EMPTY_DISCOUNT;
  }

  const discounts = [];

  eligibleTiers.forEach(tier => {
    const targetLine = input.cart.lines
      .filter(line => {
        const metafield = line.merchandise.product?.metafield;
        return metafield && metafield.value === tier.key;
      })
      .slice(0, 1); // Limit to one product per tier

    if (targetLine.length > 0) {
      const target = {
        productVariant: {
          id: targetLine[0].merchandise.id,
          quantity: 1, // Only one item should be free
        },
      };

      console.log(`Applying discount for tier ${tier.key} to product variant ID ${target.productVariant.id}`);
      
      discounts.push({
        message: tier.message,
        targets: [target],
        value: {
          percentage: {
            value: "100.0",
          },
        },
      });
    } else {
      console.log(`No products found for tier ${tier.key}`);
    }
  });

  console.log("Prepared Discounts:", JSON.stringify(discounts, null, 2));

  if (discounts.length === 0) {
    console.error("No cart lines qualify for the discount.");
    return EMPTY_DISCOUNT;
  }

  return {
    discounts,
    discountApplicationStrategy: DiscountApplicationStrategy.All,
  };
}
