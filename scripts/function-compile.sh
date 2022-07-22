#!/bin/bash

cd contracts

mkdir Function

if [ -f ./powersOfTau28_hez_final_10.ptau ]; then
    echo "powersOfTau28_hez_final_10.ptau already exists. Skipping."
else
    echo 'Downloading powersOfTau28_hez_final_10.ptau'
    wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_10.ptau
fi

echo "Compiling Function.circom..."

# compile circuit

circom ../circuits/Function.circom --r1cs --wasm --sym -o Function
snarkjs r1cs info Function/Function.r1cs

# Start a new zkey and make a contribution

snarkjs groth16 setup Function/Function.r1cs powersOfTau28_hez_final_10.ptau Function/circuit_0000.zkey
snarkjs zkey contribute Function/circuit_0000.zkey Function/circuit_final.zkey --name="1st Contributor Name" -v -e="random text"
snarkjs zkey export verificationkey Function/circuit_final.zkey Function/verification_key.json

# generate solidity contract
snarkjs zkey export solidityverifier Function/circuit_final.zkey Verifier.sol

cd ../..