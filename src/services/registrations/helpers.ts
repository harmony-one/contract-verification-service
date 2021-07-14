export const SubdomainRegisterContractAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: 'label',
        type: 'bytes32',
      },
      {
        indexed: false,
        name: 'subdomain',
        type: 'string',
      },
      {
        indexed: true,
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        name: 'expires',
        type: 'uint256',
      },
    ],
    name: 'NewRegistration',
    type: 'event',
  },
  {
    constant: true,
    inputs: [
      {
        name: 'node',
        type: 'bytes32',
      },
    ],
    name: 'twitter',
    outputs: [
      {
        name: '',
        type: 'string',
      },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
];

export const RegisterContractAbi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: 'string',
        name: 'name',
        type: 'string',
      },
      {
        indexed: true,
        internalType: 'bytes32',
        name: 'label',
        type: 'bytes32',
      },
      {
        indexed: true,
        internalType: 'address',
        name: 'owner',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'cost',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'expires',
        type: 'uint256',
      },
    ],
    name: 'NameRegistered',
    type: 'event',
  },
];

export const eventLogs = [
  {
    indexed: false,
    internalType: 'string',
    name: 'subdomain',
    type: 'string',
  },
  {
    indexed: true,
    internalType: 'bytes32',
    name: 'label',
    type: 'bytes32',
  },
  {
    indexed: true,
    internalType: 'address',
    name: 'owner',
    type: 'address',
  },
  {
    indexed: false,
    internalType: 'uint256',
    name: 'cost',
    type: 'uint256',
  },
  {
    indexed: false,
    internalType: 'uint256',
    name: 'duration',
    type: 'uint256',
  },
];

export const subDomainEventLogs = [
  {
    indexed: true,
    name: 'label',
    type: 'bytes32',
  },
  {
    indexed: false,
    name: 'subdomain',
    type: 'string',
  },
  {
    indexed: true,
    name: 'owner',
    type: 'address',
  },
  {
    indexed: false,
    name: 'duration',
    type: 'uint256',
  },
];
