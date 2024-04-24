jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));


const { sql } = require('@vercel/postgres');
const { createInvoice } = require('../app/lib/actions.ts');
// Mock the sql module
// At the top of your test file



describe('createInvoice', () => {
  it('should insert a new invoice into the database', async () => {
    // Arrange
    const formData = new FormData();
    formData.append('customerId', '123');
    formData.append('amount', '100');
    formData.append('status', 'pending');
    const date = new Date().toISOString().split('T')[0];

    // Act
    await createInvoice({}, formData);

    // Assert
    expect(sql.mock.calls[0]).toEqual([
      [
        "\n        INSERT INTO invoices (customer_id, amount, status, date)\n        VALUES (",
        ", ",
        ", ",
        ", ",
        ")\n        "
      ],
      "123",
      10000,
      "pending",
      "2024-04-24"
    ]);
  });
});


