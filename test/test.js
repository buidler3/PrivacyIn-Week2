const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16, plonk } = require("snarkjs");

const wasm_tester = require("circom_tester").wasm;

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

describe("Function", function () {
    this.timeout(100000000);
    let Verifier;
    let verifier;

    beforeEach(async function () {
        Verifier = await ethers.getContractFactory("Verifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();
    });

    it("Circuit should run correctly", async function () {
        const circuit = await wasm_tester("circuits/Function.circom");

        const INPUT = {
            "x": 1,
            "y": 2,
            "z": 5,
        }

        const witness = await circuit.calculateWitness(INPUT, true);

        // console.log(witness);

        assert(Fr.eq(Fr.e(witness[0]),Fr.e(1)));
        assert(Fr.eq(Fr.e(witness[1]),Fr.e(10)));

    });

    it("Should return true for correct proof", async function () {
        // Produce groth16 proof based on randomly selected input x=1,y=2,z=5
        const { proof, publicSignals } = await groth16.fullProve({"x":"1","y":"2","z":"5"}, "contracts/Function/Function_js/Function.wasm","contracts/Function/circuit_final.zkey");

        // Print equations represents the relation of inputs and output
        console.log('if x is  1, then f = 2x5 =',publicSignals[0]);
        
        // Generate arguments of hex format for prover contract
        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);
    
        // Ttransfer format from hex to uint
        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());
    
        // Wrap up arguments for verifying
        const a = [argv[0], argv[1]];
        const b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        const c = [argv[6], argv[7]];
        const Input = argv.slice(8);

        // Check the validity of proof by comparing expected true value
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });
    it("Should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        let d = [0]
        expect(await verifier.verifyProof(a, b, c, d)).to.be.false;
    });
});
