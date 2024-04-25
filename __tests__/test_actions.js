// Mocking Database Error
jest.mock('@vercel/postgres', () => ({
  sql: jest.fn().mockRejectedValue(new Error('Database error')),
}));


const { sql } = require('@vercel/postgres');
const { createInvoice, updateInvoice, deleteInvoice } = require('../app/lib/actions.ts');


describe('testing Database errors', () => {
  it('createInvoice should return a database error message when insertion fails', async () => {
    // Arrange
    const formData = new FormData();
    formData.append('customerId', '123');
    formData.append('amount', '100');
    formData.append('status', 'pending');

    // Act
    const result = await createInvoice({}, formData);


    console.log('Result:', result);
    // Assert
    expect(result).toEqual({
      message: 'Database Error: Failed to Create Invoice.',
    });
  });

  it('updateInvoice should return a database error message when update fails', async () => {
    // Arrange
    const formData = new FormData();
    formData.append('customerId', '123');
    formData.append('amount', '100');
    formData.append('status', 'pending');
    const invoiceID = 'f756ba89-c0e3-4df9-a69d-131bef353240'

    // Act
    const result = await updateInvoice(invoiceID, {}, formData);


    // Assert
    expect(result).toEqual({
      message: 'Database Error: Failed to Update Invoice.',
    });
  });

  it('deleteInvoice should return a database error message when delete fails', async () => {
    // Arrange
    const invoiceID = 'f756ba89-c0e3-4df9-a69d-131bef353240'

    // Act
    const result = await deleteInvoice(invoiceID);


    // Assert
    expect(result).toEqual({
      message: 'Database Error: Failed to Delete Invoice.',
    });
  });

})

jest.clearAllMocks();

// Mock the module that refreshes after sql queries
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('createInvoice', () => {
  it('should return errors when form validation fails', async () => {
    // Arrange
    const formData = new FormData();
    // Missing 'customerId' intentionally
    formData.append('amount', '100');
    formData.append('status', 'pending');

    // Act
    const result = await createInvoice({}, formData);
    // Assert
    expect(result).toEqual({
      errors: {
        customerId: ["Please select a customer."],
      },
      message: 'Missing Fields. Failed to Create Invoice.',
    });
  });


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
      "2024-04-25"
    ]);
  });
});


describe('updateInvoice', () => {
  it('should return errors when form validation fails', async () => {
    // Arrange
    const formData = new FormData();
    // Missing 'customerId' intentionally
    formData.append('amount', '100');
    formData.append('status', 'pending');
    const invoiceID = 'f756ba89-c0e3-4df9-a69d-131bef353240'

    // Act
    const result = await updateInvoice(invoiceID, {}, formData);
    // Assert
    expect(result).toEqual({
      errors: {
        customerId: ["Please select a customer."],
      },
      message: 'Missing Fields. Failed to Update Invoice.',
    });
  });


  it('should update an invoice given an invoice id', async () => {
    // Arrange
    const formData = new FormData();
    formData.append('customerId', '123');
    formData.append('amount', '100');
    formData.append('status', 'pending');

    const invoiceID = 'f756ba89-c0e3-4df9-a69d-131bef353240'

    // Act
    await updateInvoice(invoiceID, {}, formData);

    // Assert
    expect(sql.mock.calls[0]).toEqual([
      [
        "\n        UPDATE invoices\n        SET customer_id = ", ", amount = ", ", status = ","\n        WHERE id = ","\n      ",
      ],
      "123",
      10000,
      "pending",
      "f756ba89-c0e3-4df9-a69d-131bef353240"
    ]);
  });
});

describe('deleteInvoice', () => {

  it('should delete an invoice given an invoice id', async () => {
    // Arrange
    const invoiceID = 'f756ba89-c0e3-4df9-a69d-131bef353240'

    // Act
    await deleteInvoice(invoiceID);

    // Assert
    expect(sql.mock.calls[0]).toEqual([
      [
        "DELETE FROM invoices WHERE id = ", "",
      ],
      "f756ba89-c0e3-4df9-a69d-131bef353240"
    ]);
  });
});

