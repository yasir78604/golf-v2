const jwt = require('jsonwebtoken');
const { supabaseAdmin, supabasePublic } = require('../config/supabase');

// ---------- SIGNUP ----------
exports.signup = async (req, res) => {
  try {
    const { email, password, fullName, charityId, charityPercentage = 10 } = req.body;

    // Create user via Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName },
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    const userId = authData.user.id;

    // Create profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{
        id: userId,
        full_name: fullName,
        charity_id: charityId,
        charity_percentage: charityPercentage,
        subscription_status: 'pending',
        payment_status: 'none',
        role: 'user',
      }]);

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId);
      return res.status(400).json({ error: profileError.message });
    }

    res.status(201).json({
      message: 'User created. Please subscribe to activate.',
      user: { id: userId, email, fullName },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- LOGIN ----------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sign in with Supabase
    const { data: sessionData, error: sessionError } = await supabasePublic.auth.signInWithPassword({
      email,
      password,
    });

    if (sessionError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // ✅ Get profile with charity relation
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        charity:charity_id (
          id,
          name,
          description,
          image_url,
          website
        )
      `)
      .eq('id', sessionData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({ error: 'Error fetching profile' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: sessionData.user.id, email: sessionData.user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // ✅ Return user with charity
    res.json({
      message: 'Login successful',
      user: { ...sessionData.user, ...profile },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- GET CURRENT USER ----------
exports.getMe = async (req, res) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('profiles')
      .select(`
        *,
        charity:charity_id (
          id,
          name,
          description,
          image_url,
          website
        )
      `)
      .eq('id', req.user.id)
      .single();

    if (error) {
      console.error('GetMe error:', error);
      return res.status(500).json({ error: 'Error fetching profile' });
    }

    res.json({ success: true, user: profile });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: error.message });
  }
};

// ---------- LOGOUT ----------
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out successfully' });
};