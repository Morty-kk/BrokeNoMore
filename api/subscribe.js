// api/subscribe.js
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = async (req, res) => {
  // nur POST erlauben
  if (req.method !== 'POST') {
    res.statusCode = 405;
    return res.json({ error: 'Method not allowed' });
  }

  // Body parsen (Vercel macht das meistens, aber sicher ist sicher)
  const { name, email } = req.body || {};

  if (!email || typeof email !== 'string') {
    res.statusCode = 400;
    return res.json({ error: 'email is required' });
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: email.trim().toLowerCase(),
        name: name ? String(name).trim() : null,
      },
    });

    res.statusCode = 201;
    return res.json({
      id: user.id,
      email: user.email,
      createdAt: user.createdAt,
    });
  } catch (err) {
    // unique email
    if (err.code === 'P2002') {
      res.statusCode = 409;
      return res.json({ error: 'email already exists' });
    }
    console.error('subscribe error:', err);
    res.statusCode = 500;
    return res.json({ error: 'Internal server error' });
  }
};
