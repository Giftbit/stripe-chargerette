import Stripe = require("stripe");
import chai = require("chai");

export async function assertErrorThunksAreEqual(actual: () => Promise<any>, expected: () => Promise<any>): Promise<void> {
    let actualError: any;
    try {
        await actual();
    } catch (err) {
        actualError = err;
    }

    let expectedError: any;
    try {
        await expected();
    } catch (err) {
        expectedError = err;
    }

    chai.assert.isDefined(actualError, "actual is rejected");
    chai.assert.isDefined(expectedError, "expected is rejected");
    assertErrorsAreEqual(actualError, expectedError);
}

const comparableErrorKeys = ["code", "rawType", "statusCode", "type"];
const comparableRawErrorKeys = ["decline_code", "doc_url", "param"];
export function assertErrorsAreEqual(actual: any, expected: any): void {
    for (const key of comparableErrorKeys) {
        chai.assert.deepEqual(actual[key], expected[key], `comparing key '${key}'`);
    }
    for (const key of comparableRawErrorKeys) {
        chai.assert.deepEqual(actual.raw[key], expected.raw[key], `comparing key 'raw.${key}'`);
    }
}

const chargeComparableKeys: (keyof Stripe.charges.ICharge)[] = ["object", "amount", "amount_refunded", "application_fee", "captured", "currency", "description", "failure_code", "failure_message", "metadata", "paid", "receipt_email", "refunded", "status", "transfer_group"];
export function assertChargesAreBasicallyEqual(actual: Stripe.charges.ICharge, expected: Stripe.charges.ICharge, message?: string): void {
    chai.assert.match(actual.id, /^ch_/, `actual charge ID is formatted correctly ${message}`);

    for (const key of chargeComparableKeys) {
        chai.assert.deepEqual(actual[key], expected[key], `comparing key '${key}' ${message || ""}`);
    }
    chai.assert.equal(actual.refunds.total_count, expected.refunds.total_count, message);
    chai.assert.lengthOf(actual.refunds.data, actual.refunds.total_count, message);

    for (let refundIx = 0; refundIx < expected.refunds.total_count; refundIx++) {
        assertRefundsAreBasicallyEqual(actual.refunds.data[refundIx], expected.refunds.data[refundIx], `of refund ${refundIx} ${message || ""}`);
    }
}

const refundComparableKeys: (keyof Stripe.refunds.IRefund)[] = ["object", "amount", "currency", "metadata", "reason", "status"];
export function assertRefundsAreBasicallyEqual(actual: Stripe.refunds.IRefund, expected: Stripe.refunds.IRefund, message?: string): void {
    for (const key of refundComparableKeys) {
        chai.assert.deepEqual(actual[key], expected[key], `comparing key '${key}' ${message || ""}`);
    }
}

const customerKeys: (keyof Stripe.customers.ICustomer)[] = ["object", "account_balance", "address", "currency", "delinquent", "description", "discount", "email", "invoice_settings", "livemode", "metadata", "name", "phone", "shipping"];
export function assertCustomersAreBasicallyEqual(actual: Stripe.customers.ICustomer, expected: Stripe.customers.ICustomer, message?: string): void {
    for (const key of customerKeys) {
        chai.assert.deepEqual(actual[key], expected[key], `comparing key '${key}' ${message || ""}`);
    }
    chai.assert.equal(!!actual.default_source, !!expected.default_source, `both have default_source set or unset ${message}`);
    chai.assert.equal(actual.sources.total_count, expected.sources.total_count, message);
    chai.assert.lengthOf(actual.sources.data, actual.sources.total_count, message);

    for (let sourceIx = 0; sourceIx < expected.sources.total_count; sourceIx++) {
        chai.assert.equal(actual.sources.data[sourceIx].object, "card", "only card checking is supported");
        chai.assert.equal(expected.sources.data[sourceIx].object, "card", "only card checking is supported");
        chai.assert.equal((actual.sources.data[sourceIx] as Stripe.cards.ICard).customer, actual.id);
        chai.assert.equal((expected.sources.data[sourceIx] as Stripe.cards.ICard).customer, expected.id);
        assertCardsAreBasicallyEqual(actual.sources.data[sourceIx] as Stripe.cards.ICard, expected.sources.data[sourceIx] as Stripe.cards.ICard, `of refund ${sourceIx} ${message || ""}`);
    }
}

const cardKeys: (keyof Stripe.cards.ICard)[] = ["object", "address_city", "address_country", "address_line1", "address_line1_check", "address_line2", "address_state", "address_zip", "address_zip_check", "brand", "country", "cvc_check", "dynamic_last4", "exp_month", "exp_year", "funding", "last4", "metadata", "name", "tokenization_method"];
export function assertCardsAreBasicallyEqual(actual: Stripe.cards.ICard, expected: Stripe.cards.ICard, message?: string): void {
    for (const key of cardKeys) {
        chai.assert.deepEqual(actual[key], expected[key], `comparing key '${key}' ${message || ""}`);
    }
}
