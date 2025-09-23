import dataSource from '../src/config/data-source';
import { UserRole } from '../src/users/entities/user.entity';

(async () => {
  try {
    const email = process.env.SUPER_ADMIN_EMAIL;
    const password = process.env.SUPER_ADMIN_PASSWORD;
    if (!email || !password) {
      return console.log('Credentials are not provided.');
    }

    await dataSource.initialize();
    const result = await dataSource.query(
      'SELECT EXISTS(SELECT 1 FROM users WHERE roles @> $1)',
      [[UserRole.ADMIN]],
    );
    if (result?.[0]?.exists) {
      return console.log(`Admin already exists in the db.`);
    }
    await dataSource.query(
      'INSERT INTO users (email, password, roles, first_name, last_name, is_email_verified) VALUES ($1, $2, $3, $4, $5, $6)',
      [
        email,
        process.env.SUPER_ADMIN_PASSWORD,
        [UserRole.ADMIN],
        'Admin',
        'Super',
        true,
      ],
    );
    console.log(`Admin ${email} was created successfully.`);
  } catch (error) {
    console.error(error);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
    }
  }
})();
