import React, { useState } from 'react';

const CompanySettings = () => {
  const [companyInfo, setCompanyInfo] = useState({
    companyName: 'ABC Corporation',
    companyLogo: null,
    companyDomain: 'abc-corp.com',
    industry: 'Technology',
    size: '100-500'
  });

  const [approvalSettings, setApprovalSettings] = useState({
    approvalWorkflow: 'sequential',
    defaultApprover: 'department-head',
    allowRejectionFeedback: true,
    notifyOnApproval: true,
    notifyOnRejection: true
  });

  const [previewUrl, setPreviewUrl] = useState('/sample-logo.png');

  const handleCompanyInfoChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === 'file' && files[0]) {
      setCompanyInfo({
        ...companyInfo,
        [name]: files[0]
      });
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(files[0]);
    } else {
      setCompanyInfo({
        ...companyInfo,
        [name]: value
      });
    }
  };

  const handleApprovalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setApprovalSettings({
      ...approvalSettings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCompanyInfoSubmit = (e) => {
    e.preventDefault();
    alert('Company information updated!');
  };

  const handleApprovalSubmit = (e) => {
    e.preventDefault();
    alert('Approval settings updated!');
  };

  return (
    <div>
      <div className="page-header">
        <h1>Company Settings</h1>
        <p>Configure company information and settings</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Company Information</h2>
        </div>
        <form onSubmit={handleCompanyInfoSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="companyName">Company Name</label>
              <input
                type="text"
                id="companyName"
                name="companyName"
                value={companyInfo.companyName}
                onChange={handleCompanyInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="companyDomain">Company Domain</label>
              <input
                type="text"
                id="companyDomain"
                name="companyDomain"
                value={companyInfo.companyDomain}
                onChange={handleCompanyInfoChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="industry">Industry</label>
              <select
                id="industry"
                name="industry"
                value={companyInfo.industry}
                onChange={handleCompanyInfoChange}
              >
                <option value="Technology">Technology</option>
                <option value="Finance">Finance</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="size">Company Size</label>
              <select
                id="size"
                name="size"
                value={companyInfo.size}
                onChange={handleCompanyInfoChange}
              >
                <option value="1-50">1-50 employees</option>
                <option value="51-100">51-100 employees</option>
                <option value="100-500">100-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
            <div className="form-group full-width">
              <label htmlFor="companyLogo">Company Logo</label>
              <input
                type="file"
                id="companyLogo"
                name="companyLogo"
                accept="image/*"
                onChange={handleCompanyInfoChange}
              />
              {previewUrl && (
                <div style={{ marginTop: '1rem' }}>
                  <img 
                    src={previewUrl} 
                    alt="Company Logo Preview" 
                    style={{ maxHeight: '100px', maxWidth: '200px' }}
                  />
                </div>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Company Information</button>
          </div>
        </form>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Approval Workflow Settings</h2>
        </div>
        <form onSubmit={handleApprovalSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="approvalWorkflow">Approval Workflow</label>
              <select
                id="approvalWorkflow"
                name="approvalWorkflow"
                value={approvalSettings.approvalWorkflow}
                onChange={handleApprovalChange}
              >
                <option value="sequential">Sequential (One after another)</option>
                <option value="parallel">Parallel (All at once)</option>
                <option value="any">Any Approver</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="defaultApprover">Default Approver</label>
              <select
                id="defaultApprover"
                name="defaultApprover"
                value={approvalSettings.defaultApprover}
                onChange={handleApprovalChange}
              >
                <option value="department-head">Department Head</option>
                <option value="direct-manager">Direct Manager</option>
                <option value="company-admin">Company Admin</option>
                <option value="custom">Custom (Select per request)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="allowRejectionFeedback"
                  checked={approvalSettings.allowRejectionFeedback}
                  onChange={handleApprovalChange}
                />
                Allow Rejection Feedback
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notifyOnApproval"
                  checked={approvalSettings.notifyOnApproval}
                  onChange={handleApprovalChange}
                />
                Notify on Approval
              </label>
            </div>
            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="notifyOnRejection"
                  checked={approvalSettings.notifyOnRejection}
                  onChange={handleApprovalChange}
                />
                Notify on Rejection
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save Approval Settings</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompanySettings;
