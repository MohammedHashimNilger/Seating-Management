import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import styles from "../styles/Signup.module.css";

export default function Signup() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // 1️⃣ Sign up user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error) {
      alert("Sign up error: " + error.message);
      return;
    }

    // 2️⃣ Create profile row with default role "student"
    if (data?.user?.id) {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        role: "student", // default role
      });

      if (profileError) {
        console.warn("Failed to create profile:", profileError);
      }
    }

    alert("Sign up successful! You can now log in.");
    navigate("/signin");
  };

  return (

    <div className={styles.signupWrapper}>

    <div className={styles.signupPage}>
      <div className={styles.navbarSU}>
        <h1>Exam Seating Management System</h1>
      </div>

      <div className={styles.overlaySU}>
        <div className={styles.signupContainer}>
          <h1>Sign Up</h1>
          <form onSubmit={handleSignup} className={styles.signupForm}>
            <input
              type="text"
              placeholder="Full name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={styles.signupInput}
            />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={styles.signupInput}
            />
            <input
              type="password"
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.signupInput}
            />
            <button type="submit" className={styles.signupBtn}>
              Signup
            </button>
          </form>

          <p>
            Already have an account?{" "}
            <a href="/signin" className={styles.signinLink}>
              Login
            </a>
          </p>
        </div>
      </div>
    </div>
    </div>
  );
}
