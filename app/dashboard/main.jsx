import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';

function App() {
  const [classes, setClasses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);

  const addNewClass = (newClass) => {
    if (editingClass) {
      // Chế độ chỉnh sửa
      setClasses(classes.map(cls => 
        cls.id === editingClass.id ? {...newClass, id: editingClass.id} : cls
      ));
      setEditingClass(null);
    } else {
      // Chế độ thêm mới
      const classWithId = {
        ...newClass,
        id: Date.now()
      };
      setClasses([...classes, classWithId]);
    }
    setShowForm(false);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingClass(null);
  };

  const deleteClass = (id) => {
    setClasses(classes.filter(cls => cls.id !== id));
  };

  const editClass = (id) => {
    const classToEdit = classes.find(cls => cls.id === id);
    setEditingClass(classToEdit);
    setShowForm(true);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <div className="logo-circle"></div>
          <span>Cleo</span>
        </div>
        <div className="header-icons">
          <button className="icon-button" onClick={() => {setShowForm(true); setEditingClass(null);}}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
          <button className="icon-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </button>
        </div>
      </header>

      <main className="main-content">
        <h1 className="greeting">Hello, Ms. Tuyen</h1>

        {!showForm ? (
          <div className="classes-container">
            {classes.length === 0 ? (
              <div className="empty-state">
                <button className="add-button" onClick={() => setShowForm(true)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <p className="empty-text">Create a class to get started.</p>
              </div>
            ) : (
              <div className="class-grid">
                {classes.map((cls, index) => (
                  <ClassCard 
                    key={cls.id} 
                    id={cls.id}
                    className={cls.className} 
                    subject={cls.subject} 
                    number={index + 1}
                    onDelete={deleteClass} 
                    onEdit={editClass}
                  />
                ))}
                <div className="archived-courses-card">
                  <div className="archived-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 8v13H3V8"></path>
                      <path d="M1 3h22v5H1z"></path>
                      <path d="M10 12h4"></path>
                    </svg>
                  </div>
                  <p>Archived Courses</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="form-overlay">
            <div className="form-container">
              <ClassForm 
                onSubmit={addNewClass} 
                onCancel={handleCancel} 
                initialData={editingClass}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ClassForm({ onSubmit, onCancel, initialData }) {
  const [className, setClassName] = useState(initialData ? initialData.className : '');
  const [subject, setSubject] = useState(initialData ? initialData.subject : '');
  const [room, setRoom] = useState(initialData ? initialData.room : '');

  useEffect(() => {
    if (initialData) {
      setClassName(initialData.className);
      setSubject(initialData.subject);
      setRoom(initialData.room || '');
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ className, subject, room });
    // Reset form
    setClassName('');
    setSubject('');
    setRoom('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{initialData ? 'Edit Class' : 'Create New Class'}</h2>
      <input
        type="text"
        placeholder="Class name (required)"
        value={className}
        onChange={(e) => setClassName(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <input
        type="text"
        placeholder="Room"
        value={room}
        onChange={(e) => setRoom(e.target.value)}
      />
      <div className="form-buttons">
        <button type="button" className="cancel-button" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="save-button">
          {initialData ? 'Update' : 'Save'}
        </button>
      </div>
    </form>
  );
}

function ClassCard({ id, className, subject, number, onDelete, onEdit }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  return (
    <div className="class-card">
      <div className="class-number-circle">
        <span>{number}</span>
      </div>
      <div className="card-content">
        <div className="card-header">
          <h3 className="class-name">{className}</h3>
          <div className="menu-container">
            <button className="menu-button" onClick={toggleMenu}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="6" r="1"></circle>
                <circle cx="12" cy="12" r="1"></circle>
                <circle cx="12" cy="18" r="1"></circle>
              </svg>
            </button>
            {menuOpen && (
              <div className="menu-dropdown" ref={menuRef}>
                <button onClick={() => {onEdit(id); setMenuOpen(false);}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </button>
                <button onClick={() => {onDelete(id); setMenuOpen(false);}}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                  Archive
                </button>
              </div>
            )}
          </div>
        </div>
        <p className="class-subject">{subject}</p>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
