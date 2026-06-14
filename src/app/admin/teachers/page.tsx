"use client";

import { useEffect, useState } from "react";

import {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
} from "@/services/teacher.service";

import { getClasses } from "@/services/class.service";
import { getSubjects } from "@/services/subject.service";

import { assignClassesToTeacher } from "@/services/teacher.service";

export default function TeachersPage() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [classes, setClasses] = useState<any[]>([]);

  const [showClassModal, setShowClassModal] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);

  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);

  const [selectedClass, setSelectedClass] = useState("");

  const [selectedSubject, setSelectedSubject] = useState("");

  const [selectedStatus, setSelectedStatus] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",

    qualification: "",
    experience: 0,

    bio: "",

    isActive: true,
  });

  const fetchTeachers = async () => {
    try {
      const result = await getTeachers();

      setTeachers(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const openClassAssignment = (teacher: any) => {
    setSelectedTeacher(teacher);

    setSelectedClasses([]);

    setShowClassModal(true);
  };

  const handleAssignClasses = async () => {
    if (!selectedTeacher) return;

    try {
      await assignClassesToTeacher(selectedTeacher.id, selectedClasses);

      alert("Classes Assigned Successfully");

      setShowClassModal(false);

      await fetchTeachers();
    } catch (error) {
      console.error(error);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await getClasses();

      setClasses(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const result = await getSubjects();

      setSubjects(result.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
    fetchSubjects();
  }, []);

  const resetForm = () => {
    setEditingId(null);
    setSelectedClasses([]);
    setSelectedSubjects([]);

    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      qualification: "",
      experience: 0,
      bio: "",
      isActive: true,
    });
  };

  const filteredTeachers = teachers.filter((teacher: any) => {
    const matchesSearch =
      teacher.name?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.phone?.toLowerCase().includes(search.toLowerCase()) ||
      teacher.qualification?.toLowerCase().includes(search.toLowerCase());

    const matchesClass =
      !selectedClass ||
      teacher.classes?.some((cls: any) => cls.id === selectedClass);

    const matchesSubject =
      !selectedSubject ||
      teacher.subjects?.some((subject: any) => subject.id === selectedSubject);

    const matchesStatus =
      selectedStatus === ""
        ? true
        : teacher.isActive === (selectedStatus === "active");

    return matchesSearch && matchesClass && matchesSubject && matchesStatus;
  });

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await updateTeacher(editingId, {
          ...formData,
          classIds: selectedClasses,

          subjectIds: selectedSubjects,
        });
      } else {
        await createTeacher({
          ...formData,
          classIds: selectedClasses,

          subjectIds: selectedSubjects,
        });
      }

      await fetchTeachers();

      setShowModal(false);

      resetForm();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (teacher: any) => {
    setEditingId(teacher.id);

    setFormData({
      name: teacher.name || "",

      email: teacher.email || "",

      phone: teacher.phone || "",

      password: "",

      qualification: teacher.qualification || "",

      experience: teacher.experience || 0,

      bio: teacher.bio || "",

      isActive: teacher.isActive,
    });

    setSelectedClasses(teacher.classes?.map((item: any) => item.id) || []);

    setSelectedSubjects(teacher.subjects?.map((item: any) => item.id) || []);

    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this teacher?");

    if (!confirmed) return;

    try {
      await deleteTeacher(id);

      await fetchTeachers();
    } catch (error) {
      console.error(error);
    }
  };

  const filteredSubjects = subjects.filter((subject: any) =>
    selectedClasses.includes(subject.classId),
  );

  return (
    <div className="p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teachers</h1>

          <p className="text-slate-500">Manage Teachers</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="rounded-lg bg-blue-700 px-4 py-2 text-white"
        >
          Add Teacher
        </button>
      </div>

      <input
        type="text"
        placeholder="Search Teacher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 w-full rounded border p-3"
      />

      <div className="mb-4 grid grid-cols-3 gap-4">
        <select title="class"
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="rounded border p-3"
        >
          <option value="">All Classes</option>

          {classes.map((cls) => (
            <option key={cls.id} value={cls.id}>
              {cls.name} ({cls.board?.name})
            </option>
          ))}
        </select>

        <select title="subjects"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="rounded border p-3"
        >
          <option value="">All Subjects</option>

          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <select title="status"
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="rounded border p-3"
        >
          <option value="">All Status</option>

          <option value="active">Active</option>

          <option value="inactive">Inactive</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-4 text-left">Name</th>

              <th className="p-4 text-left">Email</th>

              <th className="p-4 text-left">Phone</th>

              <th className="p-4 text-left">Qualification</th>

              <th className="p-4 text-left">Experience</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredTeachers.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center">
                  No Teachers Found
                </td>
              </tr>
            ) : (
              filteredTeachers.map((teacher) => (
                <tr key={teacher.id} className="border-t">
                  <td className="p-4">{teacher.name}</td>

                  <td className="p-4">{teacher.email}</td>

                  <td className="p-4">{teacher.phone}</td>

                  <td className="p-4">{teacher.qualification}</td>

                  <td className="p-4">{teacher.experience} yrs</td>

                  <td className="p-4">
                    {teacher.isActive ? "Active" : "Inactive"}
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openClassAssignment(teacher)}
                        className="rounded bg-green-600 px-3 py-1 text-white"
                      >
                        Classes
                      </button>
                      <button
                        onClick={() => handleEdit(teacher)}
                        className="rounded bg-yellow-500 px-3 py-1 text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => handleDelete(teacher.id)}
                        className="rounded bg-red-600 px-3 py-1 text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6">
            <h2 className="mb-6 text-2xl font-bold">
              {editingId ? "Edit Teacher" : "Add Teacher"}
            </h2>

            <div className="grid gap-4 md:grid-cols-2">
              <input
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    phone: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                placeholder="Qualification"
                value={formData.qualification}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    qualification: e.target.value,
                  })
                }
                className="rounded border p-3"
              />

              <input
                type="number"
                placeholder="Experience"
                value={formData.experience}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    experience: Number(e.target.value),
                  })
                }
                className="rounded border p-3"
              />
            </div>

            <textarea
              placeholder="Bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bio: e.target.value,
                })
              }
              rows={4}
              className="mt-4 w-full rounded border p-3"
            />

            <div className="mt-4">
              <h3 className="mb-3 font-semibold">Assign Classes</h3>

              <div className="grid grid-cols-2 gap-2">
                {classes.map((item: any) => (
                  <label
                    key={item.id}
                    className="flex items-center gap-2 rounded border p-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(item.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClasses([...selectedClasses, item.id]);
                        } else {
                          setSelectedClasses(
                            selectedClasses.filter((id) => id !== item.id),
                          );
                        }
                      }}
                    />

                    <span>
                      {item.name} ({item.board?.name})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-3 font-semibold">Assign Subjects</h3>

              <div className="grid grid-cols-2 gap-2">
                {filteredSubjects.map((subject: any) => (
                  <label
                    key={subject.id}
                    className="flex items-center gap-2 rounded border p-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSubjects.includes(subject.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubjects([
                            ...selectedSubjects,
                            subject.id,
                          ]);
                        } else {
                          setSelectedSubjects(
                            selectedSubjects.filter((id) => id !== subject.id),
                          );
                        }
                      }}
                    />

                    <span>{subject.name}</span>
                  </label>
                ))}
              </div>
            </div>

            <label className="mt-4 flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    isActive: e.target.checked,
                  })
                }
              />
              Active Teacher
            </label>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 rounded border py-3"
              >
                Cancel
              </button>

              <button
                onClick={handleSubmit}
                className="flex-1 rounded bg-blue-700 py-3 text-white"
              >
                {editingId ? "Update Teacher" : "Create Teacher"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-white p-6">
            <h2 className="mb-6 text-2xl font-bold">Assign Classes</h2>

            <div className="space-y-3">
              {classes.map((item: any) => (
                <label key={item.id} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedClasses.includes(item.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedClasses([...selectedClasses, item.id]);
                      } else {
                        setSelectedClasses(
                          selectedClasses.filter((id) => id !== item.id),
                        );
                      }
                    }}
                  />

                  <span>
                    {item.name}
                    {" ("}
                    {item.board?.shortName || item.board?.name}
                    {")"}
                  </span>
                </label>
              ))}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowClassModal(false)}
                className="flex-1 rounded border py-3"
              >
                Cancel
              </button>

              <button
                onClick={handleAssignClasses}
                className="flex-1 rounded bg-green-600 py-3 text-white"
              >
                Assign Classes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
