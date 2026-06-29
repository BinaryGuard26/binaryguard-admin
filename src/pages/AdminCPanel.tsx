import { type ReactNode, useMemo, useState } from 'react';

type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'companyApprovals'
  | 'portalUsers'
  | 'services'
  | 'formContents'
  | 'adminRegistration'
  | 'adminApprovals'
  | 'adminUsers'
  | 'auditLogs';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin_operator' | 'admin_manager' | 'super_admin';
  status: 'Active' | 'Suspended';
  password: string;
  mfaCode: string;
  approved: boolean;
};

type AdminRequest = {
  id: string;
  name: string;
  email: string;
  role: AdminUser['role'];
  password: string;
  mfaCode: string;
  sponsorEmail: string;
  reason: string;
  status: 'Pending Approval' | 'Approved' | 'Rejected';
};

type PortalUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Pending Approval' | 'Active' | 'Suspended' | 'Rejected';
};

type Order = {
  id: string;
  reference: string;
  cardholder: string;
  requestType: string;
  status: string;
};

const defaultAdmin: AdminUser = {
  id: 'adm-1001',
  name: 'BinaryGuard Admin',
  email: 'admin@binaryguard.ca',
  role: 'super_admin',
  status: 'Active',
  password: 'Admin#2026!',
  mfaCode: '864209',
  approved: true
};

const initialPortalUsers: PortalUser[] = [
  { id: 'usr-1001', name: 'John Smith', email: 'john.smith@gov.mb.ca', role: 'Company User', status: 'Pending Approval' },
  { id: 'usr-1002', name: 'Sarah Ahmed', email: 'sarah.ahmed@gov.mb.ca', role: 'Manager', status: 'Active' }
];

const initialOrders: Order[] = [
  { id: 'ord-145', reference: 'ACO-2026-000145', cardholder: 'John Smith', requestType: 'New Card', status: 'Submitted' },
  { id: 'ord-146', reference: 'ACO-2026-000146', cardholder: 'Sarah Ahmed', requestType: 'Replacement Card', status: 'Under Review' }
];

const statuses = ['Submitted', 'Under Review', 'More Information Required', 'Approved', 'In Progress', 'Completed', 'Cancelled', 'Rejected'];

function titleCase(value: string) {
  return value.replaceAll('_', ' ').replace(/\b\w/g, letter => letter.toUpperCase());
}

function nextId(prefix: string) {
  return `${prefix}-${Math.random().toString(16).slice(2, 10)}`;
}

export default function AdminCPanel() {
  const [unlocked, setUnlocked] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [login, setLogin] = useState({ email: 'admin@binaryguard.ca', password: 'Admin#2026!', mfaCode: '864209' });
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([defaultAdmin]);
  const [adminRequests, setAdminRequests] = useState<AdminRequest[]>([]);
  const [portalUsers, setPortalUsers] = useState<PortalUser[]>(initialPortalUsers);
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [services, setServices] = useState({ access_card_ordering: true, camera_ordering: false, quote_requests: false, service_requests: false });
  const [formOptions, setFormOptions] = useState({
    request_type: ['New Card', 'Replacement Card', 'Temporary Card', 'Cancel Card', 'Access Change'],
    access_level: ['Standard Access', 'Manager Access', 'Restricted Area Access'],
    site: ['Winnipeg Central Office', 'Brandon Regional Office', 'Thompson Service Centre'],
    building: ['Government Administration Building', 'Norquay Building', 'Woodsworth Building']
  });
  const [customFields, setCustomFields] = useState<{ id: string; label: string; type: string; required: boolean; active: boolean }[]>([]);
  const [logs, setLogs] = useState<string[]>(['Admin CPanel initialized for admin.binaryguard.ca.']);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', role: 'admin_operator' as AdminUser['role'], password: '', mfaCode: '', sponsorEmail: 'security.lead@binaryguard.ca', inviteCode: 'BG-ADMIN-2026', reason: '' });
  const [newField, setNewField] = useState({ label: '', type: 'text', required: false });

  const pendingUsers = portalUsers.filter(user => user.status === 'Pending Approval').length;
  const pendingAdmins = adminRequests.filter(request => request.status === 'Pending Approval').length;
  const submittedOrders = orders.filter(order => order.status === 'Submitted').length;

  const currentAdmin = useMemo(() => adminUsers.find(user => user.email === login.email), [adminUsers, login.email]);

  function addLog(message: string) {
    const stamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLogs(current => [`${stamp} - ${message}`, ...current].slice(0, 50));
  }

  function unlockAdmin() {
    const admin = adminUsers.find(user => user.email === login.email);
    if (!admin || admin.status !== 'Active' || !admin.approved) {
      alert('Admin account is not active or not approved.');
      addLog(`Denied admin login for ${login.email}.`);
      return;
    }
    if (admin.password !== login.password || admin.mfaCode !== login.mfaCode) {
      alert('Invalid password or MFA code.');
      addLog(`Failed MFA/password check for ${login.email}.`);
      return;
    }
    setUnlocked(true);
    addLog(`Admin MFA login success for ${login.email}.`);
  }

  function createAdminRequest() {
    if (!adminForm.email.endsWith('@binaryguard.ca') || !adminForm.sponsorEmail.endsWith('@binaryguard.ca')) {
      alert('Admin registration requires BinaryGuard email addresses.');
      return;
    }
    if (adminForm.inviteCode !== 'BG-ADMIN-2026') {
      alert('Invalid admin invitation code.');
      return;
    }
    if (adminForm.password.length < 10) {
      alert('Admin password must be at least 10 characters.');
      return;
    }
    if (!/^\d{6}$/.test(adminForm.mfaCode)) {
      alert('MFA code must be 6 digits.');
      return;
    }
    if (adminUsers.some(user => user.email === adminForm.email) || adminRequests.some(request => request.email === adminForm.email && request.status === 'Pending Approval')) {
      alert('This admin user already exists or is pending approval.');
      return;
    }
    setAdminRequests(current => [{
      id: nextId('admreq'),
      name: adminForm.name,
      email: adminForm.email,
      role: adminForm.role,
      password: adminForm.password,
      mfaCode: adminForm.mfaCode,
      sponsorEmail: adminForm.sponsorEmail,
      reason: adminForm.reason,
      status: 'Pending Approval'
    }, ...current]);
    setAdminForm({ name: '', email: '', role: 'admin_operator', password: '', mfaCode: '', sponsorEmail: 'security.lead@binaryguard.ca', inviteCode: 'BG-ADMIN-2026', reason: '' });
    setActiveTab('adminApprovals');
    addLog('Admin registration request created inside CPanel.');
  }

  function approveAdmin(requestId: string) {
    const request = adminRequests.find(item => item.id === requestId);
    if (!request) return;
    setAdminRequests(current => current.map(item => item.id === requestId ? { ...item, status: 'Approved' } : item));
    setAdminUsers(current => [{
      id: nextId('adm'),
      name: request.name,
      email: request.email,
      role: request.role,
      status: 'Active',
      password: request.password,
      mfaCode: request.mfaCode,
      approved: true
    }, ...current]);
    addLog(`Admin account approved and activated: ${request.email}.`);
  }

  function updateAdmin(email: string, patch: Partial<AdminUser>) {
    setAdminUsers(current => current.map(user => user.email === email ? { ...user, ...patch } : user));
    addLog(`Admin account updated: ${email}.`);
  }

  function deleteAdmin(email: string) {
    if (email === login.email) {
      alert('You cannot delete the admin account you are currently using.');
      return;
    }
    setAdminUsers(current => current.filter(user => user.email !== email));
    addLog(`Admin account deleted: ${email}.`);
  }

  if (!unlocked) {
    return <main className="admin-login-shell">
      <section className="admin-login-card">
        <div className="brand-badge">BG</div>
        <p className="eyebrow">admin.binaryguard.ca</p>
        <h1>Admin CPanel Login</h1>
        <p>Only approved BinaryGuard administrators with password and MFA can manage portal.binaryguard.ca.</p>
        <label>Admin email<input value={login.email} onChange={event => setLogin({ ...login, email: event.target.value })} /></label>
        <label>Password<input type="password" value={login.password} onChange={event => setLogin({ ...login, password: event.target.value })} /></label>
        <label>MFA code<input value={login.mfaCode} maxLength={6} onChange={event => setLogin({ ...login, mfaCode: event.target.value })} /></label>
        <button className="primary" onClick={unlockAdmin}>Unlock Admin CPanel</button>
        <small>Prototype admin: admin@binaryguard.ca / Admin#2026! / 864209</small>
      </section>
    </main>;
  }

  return <main className="wp-shell">
    <aside className="wp-sidebar">
      <div className="wp-brand"><span>BG</span><div><strong>BinaryGuard</strong><small>Admin CPanel</small></div></div>
      <div className="wp-host">● admin.binaryguard.ca</div>
      <nav>
        <p>Main</p>
        <button className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>⌂ Dashboard</button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>▦ Orders</button>
        <button className={activeTab === 'companyApprovals' ? 'active' : ''} onClick={() => setActiveTab('companyApprovals')}>✓ User approvals <b>{pendingUsers}</b></button>
        <button className={activeTab === 'portalUsers' ? 'active' : ''} onClick={() => setActiveTab('portalUsers')}>👥 Portal users</button>
        <p>Portal setup</p>
        <button className={activeTab === 'services' ? 'active' : ''} onClick={() => setActiveTab('services')}>⚙ Services</button>
        <button className={activeTab === 'formContents' ? 'active' : ''} onClick={() => setActiveTab('formContents')}>✎ Form contents</button>
        <p>Administration</p>
        <button className={activeTab === 'adminRegistration' ? 'active' : ''} onClick={() => setActiveTab('adminRegistration')}>+ Register admin</button>
        <button className={activeTab === 'adminApprovals' ? 'active' : ''} onClick={() => setActiveTab('adminApprovals')}>★ Admin approvals <b>{pendingAdmins}</b></button>
        <button className={activeTab === 'adminUsers' ? 'active' : ''} onClick={() => setActiveTab('adminUsers')}>🛡 Admin users</button>
        <button className={activeTab === 'auditLogs' ? 'active' : ''} onClick={() => setActiveTab('auditLogs')}>◎ Audit logs</button>
      </nav>
    </aside>

    <section className="wp-main">
      <header className="wp-topbar">
        <div><p className="eyebrow">Admin CPanel</p><h2>{activeTab === 'dashboard' ? 'Dashboard' : titleCase(activeTab)}</h2></div>
        <div className="wp-session"><span>{currentAdmin?.name || 'Admin'}</span><button onClick={() => setUnlocked(false)}>Lock session</button></div>
      </header>

      {activeTab === 'dashboard' && <section className="wp-dashboard">
        <div className="wp-welcome"><div><p className="eyebrow">portal.binaryguard.ca</p><h3>Welcome to BinaryGuard Admin</h3><p>Manage users, approvals, order processing, services, form contents, and audit logs from one dashboard.</p></div><div className="button-row"><button className="primary" onClick={() => setActiveTab('orders')}>Process orders</button><button onClick={() => setActiveTab('formContents')}>Edit form contents</button></div></div>
        <div className="wp-metrics">
          <article><b>{orders.length}</b><span>Total orders</span></article><article><b>{submittedOrders}</b><span>Submitted</span></article><article><b>{pendingUsers}</b><span>User approvals</span></article><article><b>{pendingAdmins}</b><span>Admin approvals</span></article>
        </div>
        <div className="wp-widget-grid"><Widget title="Tenant snapshot"><p>Tenant: Government of Manitoba</p><p>Enabled services: {Object.values(services).filter(Boolean).length}</p></Widget><Widget title="Recent activity">{logs.slice(0, 6).map(log => <p key={log}>{log}</p>)}</Widget></div>
      </section>}

      {activeTab === 'adminRegistration' && <Panel title="Register admin user" note="Create a pending admin request with password and MFA details at the same time.">
        <div className="admin-form-grid">
          <label>Name<input value={adminForm.name} onChange={event => setAdminForm({ ...adminForm, name: event.target.value })} /></label>
          <label>Email<input value={adminForm.email} onChange={event => setAdminForm({ ...adminForm, email: event.target.value })} /></label>
          <label>Role<select value={adminForm.role} onChange={event => setAdminForm({ ...adminForm, role: event.target.value as AdminUser['role'] })}><option value="admin_operator">Admin Operator</option><option value="admin_manager">Admin Manager</option><option value="super_admin">Super Admin</option></select></label>
          <label>Initial password<input type="password" value={adminForm.password} onChange={event => setAdminForm({ ...adminForm, password: event.target.value })} /></label>
          <label>MFA code / seed<input maxLength={6} value={adminForm.mfaCode} onChange={event => setAdminForm({ ...adminForm, mfaCode: event.target.value })} /></label>
          <label>Invite code<input value={adminForm.inviteCode} onChange={event => setAdminForm({ ...adminForm, inviteCode: event.target.value })} /></label>
          <label>Sponsor email<input value={adminForm.sponsorEmail} onChange={event => setAdminForm({ ...adminForm, sponsorEmail: event.target.value })} /></label>
          <label>Reason<input value={adminForm.reason} onChange={event => setAdminForm({ ...adminForm, reason: event.target.value })} /></label>
        </div>
        <button className="primary" onClick={createAdminRequest}>Submit admin registration request</button>
      </Panel>}

      {activeTab === 'adminApprovals' && <Panel title="Admin approvals" note="Approve or reject admin access requests. Approved accounts use the registered password and MFA.">
        <DataTable headers={['Name', 'Email', 'Role', 'Status', 'Actions']}>{adminRequests.map(request => <tr key={request.id}><td>{request.name}</td><td>{request.email}</td><td>{titleCase(request.role)}</td><td>{request.status}</td><td><button onClick={() => approveAdmin(request.id)} disabled={request.status !== 'Pending Approval'}>Approve</button><button className="danger" onClick={() => setAdminRequests(current => current.map(item => item.id === request.id ? { ...item, status: 'Rejected' } : item))} disabled={request.status !== 'Pending Approval'}>Reject</button></td></tr>)}</DataTable>
      </Panel>}

      {activeTab === 'adminUsers' && <Panel title="Admin users" note="Edit, modify, suspend, or delete admin accounts.">
        <DataTable headers={['Name', 'Email', 'Role', 'Status', 'Password', 'MFA', 'Actions']}>{adminUsers.map(admin => <AdminUserRow key={admin.email} admin={admin} currentEmail={login.email} onSave={updateAdmin} onDelete={deleteAdmin} />)}</DataTable>
      </Panel>}

      {activeTab === 'companyApprovals' && <Panel title="Company user approvals" note="Approve portal.binaryguard.ca users submitted by organization operators.">
        <DataTable headers={['Name', 'Email', 'Role', 'Status', 'Actions']}>{portalUsers.map(user => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user.status}</td><td><button onClick={() => setPortalUsers(current => current.map(item => item.id === user.id ? { ...item, status: 'Active' } : item))}>Approve</button><button className="danger" onClick={() => setPortalUsers(current => current.map(item => item.id === user.id ? { ...item, status: 'Rejected' } : item))}>Reject</button></td></tr>)}</DataTable>
      </Panel>}

      {activeTab === 'portalUsers' && <Panel title="Portal users" note="Modify client portal users.">
        <DataTable headers={['Name', 'Email', 'Role', 'Status']}>{portalUsers.map(user => <tr key={user.id}><td>{user.name}</td><td>{user.email}</td><td>{user.role}</td><td><select value={user.status} onChange={event => setPortalUsers(current => current.map(item => item.id === user.id ? { ...item, status: event.target.value as PortalUser['status'] } : item))}><option>Pending Approval</option><option>Active</option><option>Suspended</option><option>Rejected</option></select></td></tr>)}</DataTable>
      </Panel>}

      {activeTab === 'orders' && <Panel title="Access card orders" note="Process and update request statuses.">
        <DataTable headers={['Reference', 'Cardholder', 'Type', 'Status']}>{orders.map(order => <tr key={order.id}><td>{order.reference}</td><td>{order.cardholder}</td><td>{order.requestType}</td><td><select value={order.status} onChange={event => setOrders(current => current.map(item => item.id === order.id ? { ...item, status: event.target.value } : item))}>{statuses.map(status => <option key={status}>{status}</option>)}</select></td></tr>)}</DataTable>
      </Panel>}

      {activeTab === 'services' && <Panel title="Tenant services" note="Enable or disable services on portal.binaryguard.ca.">
        <div className="service-admin-grid">{Object.entries(services).map(([key, enabled]) => <article key={key}><h4>{titleCase(key)}</h4><p>{enabled ? 'Enabled' : 'Disabled'}</p><button onClick={() => setServices(current => ({ ...current, [key]: !enabled }))}>{enabled ? 'Disable' : 'Enable'}</button></article>)}</div>
      </Panel>}

      {activeTab === 'formContents' && <Panel title="Access Card Ordering form contents" note="Add, edit, modify, or delete dropdown contents and custom fields.">
        <div className="form-content-grid">{Object.entries(formOptions).map(([group, values]) => <article key={group}><h4>{titleCase(group)}</h4>{values.map((value, index) => <div className="option-row" key={`${group}-${index}`}><input value={value} onChange={event => setFormOptions(current => ({ ...current, [group]: current[group as keyof typeof current].map((item, idx) => idx === index ? event.target.value : item) }))} /><button className="danger" onClick={() => setFormOptions(current => ({ ...current, [group]: current[group as keyof typeof current].filter((_, idx) => idx !== index) }))}>Delete</button></div>)}<button onClick={() => setFormOptions(current => ({ ...current, [group]: [...current[group as keyof typeof current], 'New Option'] }))}>Add option</button></article>)}</div>
        <h4>Custom fields</h4><div className="option-row"><input placeholder="Field label" value={newField.label} onChange={event => setNewField({ ...newField, label: event.target.value })} /><select value={newField.type} onChange={event => setNewField({ ...newField, type: event.target.value })}><option value="text">Text</option><option value="date">Date</option><option value="textarea">Long text</option></select><label className="inline-check"><input type="checkbox" checked={newField.required} onChange={event => setNewField({ ...newField, required: event.target.checked })} /> Required</label><button onClick={() => { if (!newField.label) return; setCustomFields(current => [...current, { id: nextId('fld'), label: newField.label, type: newField.type, required: newField.required, active: true }]); setNewField({ label: '', type: 'text', required: false }); }}>Add field</button></div>
        <DataTable headers={['Label', 'Type', 'Required', 'Status', 'Actions']}>{customFields.map(field => <tr key={field.id}><td>{field.label}</td><td>{field.type}</td><td>{field.required ? 'Yes' : 'No'}</td><td>{field.active ? 'Active' : 'Hidden'}</td><td><button onClick={() => setCustomFields(current => current.map(item => item.id === field.id ? { ...item, active: !item.active } : item))}>{field.active ? 'Hide' : 'Show'}</button><button className="danger" onClick={() => setCustomFields(current => current.filter(item => item.id !== field.id))}>Delete</button></td></tr>)}</DataTable>
      </Panel>}

      {activeTab === 'auditLogs' && <Panel title="Audit logs" note="Review admin and portal actions.">{logs.map(log => <p className="audit-line" key={log}>{log}</p>)}</Panel>}
    </section>
  </main>;
}

function Panel({ title, note, children }: { title: string; note: string; children: ReactNode }) {
  return <section className="wp-panel"><div className="wp-panel-title"><h3>{title}</h3><p>{note}</p></div>{children}</section>;
}

function Widget({ title, children }: { title: string; children: ReactNode }) {
  return <section className="wp-panel"><div className="wp-panel-title"><h3>{title}</h3></div>{children}</section>;
}

function DataTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return <div className="table-wrap"><table><thead><tr>{headers.map(header => <th key={header}>{header}</th>)}</tr></thead><tbody>{children}</tbody></table></div>;
}

function AdminUserRow({ admin, currentEmail, onSave, onDelete }: { admin: AdminUser; currentEmail: string; onSave: (email: string, patch: Partial<AdminUser>) => void; onDelete: (email: string) => void }) {
  const [draft, setDraft] = useState(admin);
  return <tr>
    <td><input value={draft.name} onChange={event => setDraft({ ...draft, name: event.target.value })} /></td>
    <td>{admin.email}</td>
    <td><select value={draft.role} onChange={event => setDraft({ ...draft, role: event.target.value as AdminUser['role'] })}><option value="admin_operator">Admin Operator</option><option value="admin_manager">Admin Manager</option><option value="super_admin">Super Admin</option></select></td>
    <td><select value={draft.status} onChange={event => setDraft({ ...draft, status: event.target.value as AdminUser['status'] })}><option>Active</option><option>Suspended</option></select></td>
    <td><input value={draft.password} onChange={event => setDraft({ ...draft, password: event.target.value })} /></td>
    <td><input value={draft.mfaCode} maxLength={6} onChange={event => setDraft({ ...draft, mfaCode: event.target.value })} /></td>
    <td><button onClick={() => onSave(admin.email, draft)}>Save</button><button className="danger" disabled={admin.email === currentEmail} onClick={() => onDelete(admin.email)}>Delete</button></td>
  </tr>;
}
