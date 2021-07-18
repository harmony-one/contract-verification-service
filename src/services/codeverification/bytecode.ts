import fs from 'fs';
import path from 'path';

export const getCompiledByteCode = ({ contractAddress, contractName }) => {
  const data = fs
    .readFileSync(
      path.resolve(__dirname, contractAddress, 'build', 'contracts', contractName + '.json')
    )
    .toString();
  const { deployedBytecode, bytecode } = JSON.parse(data);
  return { deployedBytecode, bytecode };
};
