import { DataSource } from 'typeorm';
import { PricingConfig, PricingType } from '../entities/pricing-config.entity';

export const seedPricingConfig = async (dataSource: DataSource): Promise<void> => {
  const pricingConfigRepository = dataSource.getRepository(PricingConfig);

  // Check if pricing config already exists
  const existingConfig = await pricingConfigRepository.findOne({
    where: { pricingType: PricingType.PLATFORM_FEE },
  });

  if (existingConfig) {
    console.log('Pricing configuration already exists, skipping seed...');
    return;
  }

  const defaultPricingConfigs = [
    {
      pricingType: PricingType.PLATFORM_FEE,
      value: 15.0, // 15%
      name: 'Platform Fee',
      description: 'Default platform fee percentage for all transactions',
      unit: 'percentage',
      isActive: true,
      metadata: {
        description: 'Standard platform fee for beauty services',
        category: 'transaction_fee',
      },
    },
    {
      pricingType: PricingType.WITHDRAWAL_FEE,
      value: 2.50, // $2.50
      name: 'Withdrawal Fee',
      description: 'Fixed fee for processing withdrawal requests',
      unit: 'fixed_amount',
      isActive: true,
      metadata: {
        description: 'Standard withdrawal processing fee',
        category: 'withdrawal_fee',
      },
    },
    {
      pricingType: PricingType.PROCESSING_FEE,
      value: 2.9, // 2.9%
      name: 'Payment Processing Fee',
      description: 'Stripe payment processing fee percentage',
      unit: 'percentage',
      isActive: true,
      metadata: {
        description: 'Standard Stripe processing fee',
        category: 'payment_processing',
      },
    },
    {
      pricingType: PricingType.MINIMUM_WITHDRAWAL,
      value: 25.0, // $25.00
      name: 'Minimum Withdrawal Amount',
      description: 'Minimum amount required for withdrawal requests',
      unit: 'fixed_amount',
      isActive: true,
      metadata: {
        description: 'Minimum withdrawal threshold',
        category: 'withdrawal_limit',
      },
    },
    {
      pricingType: PricingType.MAXIMUM_WITHDRAWAL,
      value: 10000.0, // $10,000.00
      name: 'Maximum Withdrawal Amount',
      description: 'Maximum amount allowed for withdrawal requests',
      unit: 'fixed_amount',
      isActive: true,
      metadata: {
        description: 'Maximum withdrawal threshold',
        category: 'withdrawal_limit',
      },
    },
  ];

  for (const config of defaultPricingConfigs) {
    const pricingConfig = pricingConfigRepository.create(config);
    await pricingConfigRepository.save(pricingConfig);
    console.log(`Created pricing config: ${config.name}`);
  }

  console.log('Pricing configuration seeding completed!');
};
