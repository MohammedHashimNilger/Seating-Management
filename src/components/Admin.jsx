import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import styles from "../styles/Admin.module.css";
import Papa from "papaparse";
import {
  LogOut,
  Upload,
  Search,
  UserPlus,
  FileSpreadsheet,
  Sun,
  Moon,
  Eye,
} from "lucide-react";


export default function Admin() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [records, setRecords] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [roomLayout, setRoomLayout] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  // ----------------- LOAD RECORDS -----------------
  const loadRecords = async () => {
    const { data, error } = await supabase.from("mock_exam_data").select("*");
    if (error) return console.error("Error loading records:", error);
    setRecords(data);
  };

  // ----------------- LOAD DISTINCT ROOMS -----------------
  const loadRooms = async () => {
    const { data, error } = await supabase.from("mock_exam_data").select("roomNumber");
    if (error) return console.error("Error loading rooms:", error);
    const uniqueRooms = [...new Set(data.map(r => r.roomNumber))].sort();
    setRooms(uniqueRooms);
  };

  // ----------------- AUTH & ROLE CHECK -----------------
  useEffect(() => {
    async function checkAuth() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return navigate("/signin");

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userData.user.id)
        .single();

      if (profileError || !profile) {
        alert("Profile missing. Contact super-admin.");
        await supabase.auth.signOut();
        return navigate("/signin");
      }

      if (profile.role !== "admin") return navigate("/student");

      setUser(userData.user);
      setLoading(false);
      await loadRecords();
      await loadRooms();
    }

    checkAuth();
  }, [navigate]);

  if (loading) return <p className={styles.loadingText}>Loading...</p>;

  // ----------------- LOGOUT -----------------
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/signin");
  };

  // ----------------- ADD SINGLE STUDENT -----------------
  const handleAddStudent = async (e) => {
    e.preventDefault();
    const formData = Object.fromEntries(new FormData(e.target).entries());
    const { error } = await supabase.from("mock_exam_data").insert([formData]);
    if (error) alert("Error adding student: " + error.message);
    else {
      alert("✅ Student added successfully!");
      e.target.reset();
      loadRecords();
      loadRooms();
    }
  };

  // ----------------- BULK CSV UPLOAD -----------------
  const handleCsvUpload = () => {
    const file = document.getElementById("csvFile").files[0];
    if (!file) return alert("Please select a CSV file first.");

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        const data = results.data;
        const { error } = await supabase
          .from("mock_exam_data")
          .insert(data, { onConflict: "rollNumber" });
        if (error) alert("Bulk upload error: " + error.message);
        else {
          alert("✅ Bulk upload successful!");
          loadRecords();
          loadRooms();
        }
      },
    });
  };

  // ----------------- VIEW ROOM LAYOUT -----------------
  const handleViewLayout = async () => {
    if (!selectedRoom) return;

    const { data, error } = await supabase
      .from("mock_exam_data")
      .select("*")
      .eq("roomNumber", selectedRoom);

    if (error) return console.error("Error loading layout:", error);

    // Build a full 48-seat grid
    const totalSeats = 48; // 6 columns x 8 rows
    const seatGrid = Array.from({ length: totalSeats }, (_, i) => {
      const seatNumber = i + 1; // 1-based numbering
      const student = data.find(s => Number(s.seatNumber) === seatNumber);
      return {
        seatNumber,
        studentName: student?.studentName || null,
        rollNumber: student?.rollNumber || null,
      };
    });

    setRoomLayout(seatGrid);
  };


  const filteredRecords = records.filter(r => {
    const query = searchQuery.toLowerCase();
    return (
      r.studentName.toLowerCase().includes(query) ||
      r.rollNumber.toString().includes(query)    
    );
  });

  // ----------------- RENDER -----------------
  return (
    <div class="sp">

    <div className={`${styles.pageWrapper} ${darkMode ? styles.dark : ""}`}>

    
    <div className={styles.adminContainer}>
      <nav className={styles.navbar}>
        <h1 className={styles.navbarTitle}>Admin Panel</h1>
        <span className={styles.navbarUser}>Welcome, {user?.user_metadata?.full_name || user?.email}</span>

        <button
    className={styles.btnToggleDark}
    onClick={() => setDarkMode(!darkMode)}
  >
    {darkMode ? (
      <>
        <Sun size={18} /> Light Mode
      </>
    ) : (
      <>
        <Moon size={18} /> Dark Mode
      </>
    )}
  </button>

  <button className={styles.btnLogout} onClick={handleLogout}>
    <LogOut size={18} /> Logout
  </button>
      </nav>

      <div className={styles.container}>
        {/* Add Single Student */}
        <section className={styles.addStudentSection}>
          <h1 className={styles.cH1}>
              <UserPlus size={20} />Add Single Student
          </h1>
          <form className={styles.studentForm} onSubmit={handleAddStudent}>
            <div className={styles.formGrid}>
              <input type="text" name="rollNumber" placeholder="Roll Number" required />
              <input type="text" name="studentName" placeholder="Student Name" required />
              <input type="text" name="roomNumber" placeholder="Room Number" required />
              <input type="text" name="seatNumber" placeholder="Seat Number" required />
              <input type="text" name="examDate" placeholder="Exam Date" required />
              <input type="text" name="examTime" placeholder="Exam Time" required />
              <input type="number" name="row" placeholder="Row" required />
              <input type="number" name="col" placeholder="Col" required />
              <input type="text" name="floor" placeholder="Floor (optional)" />
            </div>
            <button type="submit" className={styles.btnSubmit}>Add Student</button>
          </form>
        </section>

        {/* Bulk CSV Upload */}
        <section className={styles.bulkUploadSection}>
          <h2 className={styles.cH2}>
            <FileSpreadsheet size={20} /> Bulk Upload CSV
          </h2>
          <div className={styles.csvUpload}>
            <input type="file" id="csvFile" accept=".csv" className={styles.csvFileInput} />
            <button className={styles.btnUpload} onClick={handleCsvUpload}>
              <Upload size={18} /> Upload CSV
            </button>
          </div>
        </section>

        {/* Existing Records */}
        <section className={styles.recordsSection}>
          <h2 className={styles.cH2}>Existing Records</h2>

          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          <div className={styles.recordsTableWrapper}>
            <table className={styles.recordsTable}>
              <thead>
                <tr>
                  <th>Roll</th>
                  <th>Name</th>
                  <th>Room</th>
                  <th>Seat</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Row</th>
                  <th>Col</th>
                  <th>Floor</th>
                </tr>
              </thead>
              <tbody>
  {filteredRecords.length > 0 ? (
    filteredRecords.map(r => (
      <tr key={r.rollNumber}>
        <td>{r.rollNumber}</td>
        <td>{r.studentName}</td>
        <td>{r.roomNumber}</td>
        <td>{r.seatNumber}</td>
        <td>{r.examDate}</td>
        <td>{r.examTime}</td>
        <td>{r.row}</td>
        <td>{r.col}</td>
        <td>{r.floor || "-"}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="9">No matching records found.</td>
    </tr>
  )}
</tbody>

            </table>
          </div>
        </section>

        {/* Room Layout Viewer */}
        <section className={styles.roomLayoutSection}>
          <h2 className={styles.cH2}>
            <Eye size={20} /> Room Layout Viewer
          </h2>
          <div className={styles.layoutViewer}>
            <select value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
              <option value="">Select a Room</option>
              {rooms.map(room => (
                <option key={room} value={room}>{room}</option>
              ))}
            </select>
            <button className={styles.btnViewLayout} onClick={handleViewLayout}>
              <Eye size={18} /> View Layout
            </button>
          </div>

          <div className={styles.roomLayout}>
            <div className={styles.seatGrid}>
              {roomLayout.map(s => (
                <div key={s.seatNumber} className={`${styles.seat} ${s.studentName ? styles.occupied : styles.empty}`}>
                  <strong>{s.seatNumber}</strong>
                  <br />
                  {s.studentName || "-"}
                  <br />
                  {s.rollNumber || "-"}
                </div>
              ))}
            </div>
            {roomLayout.length === 0 && selectedRoom && <p className={styles.noStudents}>No students assigned to this room.</p>}
            {!selectedRoom && <p className={styles.selectRoom}>Select a room to view layout.</p>}
          </div>
        </section>
      </div>
    </div>

    </div>
    </div>
  );
}
