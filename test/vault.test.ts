import { describe, it } from "node:test";
import hre from "hardhat";
import assert from "node:assert";

const { viem } = await hre.network.connect();

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
});
