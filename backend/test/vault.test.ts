import { describe, it, beforeEach } from "node:test";
import hre from "hardhat";
import assert from "node:assert";

const { viem, networkHelpers } = await hre.network.connect();

describe("Vault", function () {

    let vault: any;
    let deployer: any;
    let owner: any;
    let user: any;
    let publicClient: any;

    beforeEach(async function () {
        [deployer, user] = await viem.getWalletClients();
        owner = deployer;
        vault = await viem.deployContract("Vault");
        publicClient = await viem.getPublicClient();
    });

    describe("Deposit", function () {

        it("Should accept deposits", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 10n ** 18n
            });

            const depoInfo = await vault.read.depoInfo([user.account.address]);

            assert.equal(depoInfo[0], 10n ** 18n);
        });

        it("Should reject zero deposit", async function () {

            await assert.rejects(
                vault.write.deposit({
                    account: user.account,
                    value: 0n
                }),
                {
                    message: /Send some ETH/
                }
            );
        });

    });

    describe("Withdraw", function () {

        it("Should revert withdraw before 7 days", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 10n ** 18n
            });

            await assert.rejects(
                vault.write.withdraw(
                    [10n ** 18n],
                    { account: user.account }),
                {
                    message: /7 days not completed/
                }
            );
        });

        it("Should deduct 2% when withdrawn", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 10n ** 18n
            });

            await networkHelpers.time.increase(7 * 24 * 60 * 60);
            await networkHelpers.mine();

            const feeBalanceBefore = await vault.read.feeBalance();

            await vault.write.withdraw(
                [10n ** 18n],
                { account: user.account }
            );

            const feeBalanceAfter = await vault.read.feeBalance();

            const expectedFee = 2n * 10n ** 16n;

            assert.strictEqual(
                feeBalanceAfter,
                feeBalanceBefore + expectedFee
            );
        });

        it("Should allow partial withdraw", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 2n * 10n ** 18n
            });

            await networkHelpers.time.increase(7 * 24 * 60 * 60);
            await networkHelpers.mine();

            const [amountBefore, timeBefore] = await vault.read.depoInfo([
                user.account.address
            ]);

            await vault.write.withdraw(
                [10n ** 18n],
                { account: user.account }
            );

            const [amountAfter, timeAfter] = await vault.read.depoInfo([
                user.account.address
            ]);

            assert.strictEqual(amountAfter, amountBefore - (10n ** 18n));
        });

        it("Should not allow withdrawal more than deposited", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 1n * 10n ** 18n
            });

            await networkHelpers.time.increase(7 * 24 * 60 * 60);
            await networkHelpers.mine();

            await assert.rejects(
                vault.write.withdraw(
                    [2n * 10n ** 18n],
                    { account: user.account }
                ));
        });

        it("Should not allow double withdrawal", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 1n * 10n ** 18n
            });

            await networkHelpers.time.increase(7 * 24 * 60 * 60);
            await networkHelpers.mine();

            await vault.write.withdraw(
                [1n * 10n ** 18n],
                { account: user.account }
            );

            await assert.rejects(
                vault.write.withdraw(
                    [1n * 10n ** 18n],
                    { account: user.account }
                ));
        });

        it("Withdraw should fail when paused", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 1n * 10n ** 18n
            });

            await networkHelpers.time.increase(7 * 24 * 60 * 60);
            await networkHelpers.mine();

            await vault.write.pause({
                account: owner.account
            });

            await assert.rejects(
                vault.write.withdraw(
                    [1n * 10n ** 18n],
                    { account: user.account }
                ));
        });

    });

    describe("Fee Logic", function () {

        it("should allow only owner to withdraw fees", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 10n ** 18n
            });

            await networkHelpers.time.increase(7 * 24 * 60 * 60);
            await networkHelpers.mine();

            await vault.write.withdraw(
                [10n ** 18n],
                { account: user.account }
            );

            const feeBalance = await vault.read.feeBalance();

            await vault.write.feeWithdraw(
                [feeBalance],
                { account: owner.account }
            );

            const newFeeBalance = await vault.read.feeBalance();

            assert.strictEqual(newFeeBalance, 0n);
        });

        it("Should revert if non-owner tries to withdraw fees", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 10n ** 18n
            });

            await networkHelpers.time.increase(7 * 24 * 60 * 60 + 1);

            await vault.write.withdraw(
                [10n ** 18n],
                { account: user.account }
            );

            const feeBalance = await vault.read.feeBalance();

            await assert.rejects(
                vault.write.feeWithdraw(
                    [feeBalance],
                    { account: user.account }
                ),
                /Ownable/
            );
        });

        it("Should check contract balance after withdrawal", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 1n * 10n ** 18n
            });

            await networkHelpers.time.increase(7 * 24 * 60 * 60);
            await networkHelpers.mine();

            await vault.write.withdraw(
                [1n * 10n ** 18n],
                { account: user.account }
            );

            const balanceAfter = await publicClient.getBalance({
                address: vault.address
            });

            const feeBalance = await vault.read.feeBalance();

            assert.strictEqual(balanceAfter, feeBalance);
        });

    });

    describe("Pause", function () {

        it("Owner should be able to pause or unpause", async function () {

            await vault.write.deposit({
                account: user.account,
                value: 1n * 10n ** 18n
            });

            await networkHelpers.time.increase(7 * 24 * 60 * 60);
            await networkHelpers.mine();

            await vault.write.pause({
                account: owner.account
            });

            await assert.rejects(
                vault.write.withdraw(
                    [1n * 10n ** 18n],
                    { account: user.account }
                ));

            await vault.write.unpause({
                account: owner.account
            });

            await vault.write.withdraw(
                [1n * 10n ** 18n],
                { account: user.account }
            );

            const [amountAfter] = await vault.read.depoInfo([
                user.account.address
            ]);

            assert.strictEqual(amountAfter, 0n);
        });

    });

});