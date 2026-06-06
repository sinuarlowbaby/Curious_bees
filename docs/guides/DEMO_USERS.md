# CuriousBees V2 — Demo Users Roster

This roster outlines the pre-seeded mock users created by `npm run db:seed`. When `AUTH_MODE=bypass` is enabled in `.env`, these users can be simulated directly on the frontend using the **Dev Override Switcher** (located in the bottom-right corner of the portal), or via the `/login` developer sandbox.

---

## 🧑‍💻 1. Scholars (RESEARCH_SCHOLAR)

Scholars can log publications, submit periodic research progress reports, join workspaces, download shared documents, and participate in academic discussion threads.

### 👤 Suresh Karthik
* **Email**: `scholar.suresh@srmist.edu.in`
* **Supervisor**: Dr. Anand Ramachandran
* **Department**: Computing Technologies (CSE / IT / Swe)
* **Research Focus**: Generative AI, LLMs, and Parameter-Efficient Fine-Tuning (PEFT)
* **Pre-seeded Assets**:
  * **Workspaces**: Genomic Sequencing & Waveguide Photonic Modulators (Member)
  * **Publications**: "Parameter-Efficient Fine-Tuning of Vision-Language Models..."
  * **Progress Reports**: May 2026 Progress Report (`APPROVED` by Dr. Anand)
  * **Notifications**: Mapped approval welcome alert.

### 👤 Divya Nambiar
* **Email**: `scholar.divya@srmist.edu.in`
* **Supervisor**: Dr. Priya Subramanian
* **Department**: Biotechnology & Bioengineering
* **Research Focus**: Cancer Immunotherapy, Bioinformatics, and Graph Neural Networks
* **Pre-seeded Assets**:
  * **Workspaces**: Genomic Sequencing & Waveguide Photonic Modulators (Member)
  * **Publications**: "Graph Neural Networks for Molecular Modeling..."
  * **Progress Reports**: Bi-Annual Research Seminar Status (`PENDING` supervisor grade)

---

## 👩‍🏫 2. Supervisors (RESEARCH_SUPERVISOR)

Supervisors oversee PhD scholars, grade and approve submitted progress logs, manage collaborative workspaces, post opportunities, and publish academic announcements.

### 👤 Dr. Anand Ramachandran
* **Email**: `dr.anand@srmist.edu.in`
* **Department**: Computing Technologies (CSE / IT / Swe)
* **MAPPED Scholar**: Suresh Karthik
* **Pre-seeded Assets**:
  * **Opportunities**: PhD position: "Reinforcement Learning for Smart Grid Optimization"
  * **Discussion Threads**: Started "Call for Collaboration: GPGPU Resource Sharing..."
  * **Approvals**: Graded and approved Suresh's May progress report.

### 👤 Dr. Priya Subramanian
* **Email**: `dr.priya@srmist.edu.in`
* **Department**: Biotechnology & Bioengineering
* **MAPPED Scholar**: Divya Nambiar
* **Pre-seeded Assets**:
  * **Workspaces**: Owner of "Genomic Sequencing & Waveguide Photonic Modulators"
  * **Discussion Threads**: Started "Interdisciplinary Study on Silicon Photonics..."
  * **Approvals**: Has a pending review item for Divya's seminar progress report.

### 👤 Dr. Ramesh Kumar
* **Email**: `dr.ramesh@srmist.edu.in`
* **Department**: Electronics & Communication Engineering (ECE)
* **Pre-seeded Assets**:
  * **Workspaces**: Member of "Genomic Sequencing & Waveguide Photonic Modulators"
  * **Discussion Threads**: Replied to Dr. Priya's Photonics proposal thread.

---

## 👑 3. Administrator (INSTITUTION_ADMIN)

Administrators manage users, review all system registrations, configure campus departments, and audit system reports.

### 👤 CuriousBees Admin
* **Email**: `admin@srmist.edu.in`
* **Access Level**: Full admin panel access.
* **Views available**:
  * **User Management**: `/admin/users` (verify roles, approve onboardings, suspend users).
  * **Department Catalog**: `/admin/departments` (add or modify campus departments).
  * **Citation Analytics**: `/admin/analytics` (inspect charts showing publication statistics per department).
  * **System Settings**: `/admin/settings` (view system resource diagnostics).
