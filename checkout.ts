interface PricingRule {
    sku: string;
    specialOffer?: {
        type: 'bulkDiscount' | 'buy2Get1Free';
        threshold?: number;
        discountPrice?: number;
        buyX?: number;
        getY?: number;
    }
    price: number
}

const pricingRules: PricingRule[] = [
    { sku: 'ipd', price: 549.99, specialOffer: { type: 'bulkDiscount', threshold: 4, discountPrice: 499.99 } },
    { sku: 'mbp', price: 1399.99 },
    { sku: 'atv', price: 109.50, specialOffer: { type: 'buy2Get1Free', buyX: 2, getY: 1 } },
    { sku: 'vga', price: 30 }
];

class Checkout {
    pricingRules: PricingRule[];
    cart: { [sku: string]: number };

    constructor(pricingRules: PricingRule[]) {
        this.pricingRules = pricingRules;
        this.cart = {};
    }

    scan(item: string): void {
        if (!this.cart[item]) {
            this.cart[item] = 1;
        } else {
            this.cart[item]++;
        }
    }

    total(): number {
        let totalPrice = 0;
        let calculatedItems: string[] = []

        for (const sku in this.cart) {
            const quantity = this.cart[sku];
            const pricingRule = this.getPricingRuleBySku(sku);

            if (pricingRule) {
                if (pricingRule.specialOffer) {
                    const { type, threshold, discountPrice, buyX, getY } = pricingRule.specialOffer;

                    if (type === 'bulkDiscount' && threshold && quantity > threshold && !this.arrayIncludes(calculatedItems,sku)) {
                        totalPrice += discountPrice ? discountPrice * quantity : 0;
                        calculatedItems.push(sku);
                    } else if (type === 'buy2Get1Free' && buyX && getY && !this.arrayIncludes(calculatedItems,sku)) {
                        const discountFactor = Math.floor(quantity / (buyX + getY));
                        totalPrice += (quantity - discountFactor * getY) * this.getPrice(sku);
                    }
                } else {
                    totalPrice += quantity * this.getPrice(sku);
                }
            }
        }
        this.cart = {};
        return totalPrice;
    }

    getPrice(sku: string): number {
        const pricingRule = this.getPricingRuleBySku(sku);
        return pricingRule ? pricingRule.specialOffer?.discountPrice || pricingRule.price : 0;
    }

    private getPricingRuleBySku(sku: string): PricingRule | undefined {
        for (const rule of this.pricingRules) {
            if (rule.sku === sku) {
                return rule;
            }
        }
        return undefined;
    }

    private arrayIncludes(array: string[], element: string): boolean {
        return array.indexOf(element) !== -1;
    }
}

const cart1 = new Checkout(pricingRules);
cart1.scan('atv');
cart1.scan('atv');
cart1.scan('atv');
cart1.scan('vga');
console.log('Total expected:', cart1.total()); // Output: Total expected: $249.00

const cart2 = new Checkout(pricingRules);
cart2.scan('atv');
cart2.scan('ipd');
cart2.scan('ipd');
cart2.scan('atv');
cart2.scan('ipd');
cart2.scan('ipd');
cart2.scan('ipd');
console.log('Total expected:', cart2.total()); // Output: Total expected: $2718.95