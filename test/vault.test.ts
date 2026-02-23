import { describe, it } from "node:test";
import hre from "hardhat";
import assert from "node:assert";
import { deployContract } from "viem/zksync";
import strict from "node:assert/strict";

const { viem, networkHelpers } = await hre.network.connect();

describe("Vault", function () {

    it("Should accept deposits", async function () {

        const [deployer, user] = await viem.getWalletClients();

        const vault = await viem.deployContract("Vault");

        await vault.write.deposit({
            account: user.account,
            value: 10n ** 18n
        });

        const depoInfo = await vault.read.depoInfo([user.account.address]);

        assert.equal(depoInfo[0], 10n ** 18n);
    });

    it("Should reject zero deposit", async function () {

        const [deployer, user] = await viem.getWalletClients();

        const vault = await viem.deployContract("Vault", []);

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

    it("Should revert withdraw before 7 days", async function () {

        const [owner, user] = await viem.getWalletClients();

        const vault = await viem.deployContract("Vault");

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
    })

    it("Should deduct 2% when withdrawn", async function () {
        const [owner, user] = await viem.getWalletClients();
        const vault = await viem.deployContract("Vault");

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
    })

    it("should allow only owner to withdraw fees", async function () {
        const [owner, user] = await viem.getWalletClients();
        const vault = await viem.deployContract("Vault");

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
    })

    it("Should revert if non-owner tries to withdraw fees", async function () {
        const [owner, user] = await viem.getWalletClients();
        const vault = await viem.deployContract("Vault", []);

        // Generate fee first
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

        // Non-owner attempt
        await assert.rejects(
            vault.write.feeWithdraw(
                [feeBalance],
                { account: user.account }
            ),
            /Ownable/
        );
    });
});
