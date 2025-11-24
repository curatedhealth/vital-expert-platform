# Contributing to VITAL Path Healthcare AI Platform

Thank you for your interest in contributing to VITAL Path! This project is a healthcare AI platform, so we have additional requirements to ensure patient safety and regulatory compliance.

## 🏥 Healthcare Development Guidelines

### Before You Start
- **Read our Security Policy**: Review [SECURITY.md](./SECURITY.md) thoroughly
- **Understand HIPAA**: Familiarize yourself with HIPAA requirements
- **Review Medical AI Guidelines**: Understand our medical safety frameworks

### Required Reading
- [FDA Software as Medical Device Guidance](https://www.fda.gov/medical-devices/digital-health-center-excellence/software-medical-device-samd)
- [PHARMA Framework Documentation](./docs/medical-frameworks/PHARMA.md)
- [Healthcare Compliance Guidelines](./docs/compliance/README.md)

## 🚀 Getting Started

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/vital-path-platform.git
   cd vital-path-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.local.template .env.local
   # Edit .env.local with your configuration
   ```

4. **Run healthcare compliance checks**
   ```bash
   npm run healthcare:check
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

### Development Environment Requirements
- Node.js 18.x or higher
- PostgreSQL 15+ (for healthcare data storage)
- Docker (for consistent development environments)
- Git with commit signing enabled

## 📋 Contribution Process

### 1. Create an Issue
Before contributing code, create an issue describing:
- **Feature/Bug**: What you want to implement or fix
- **Healthcare Impact**: How this affects patient safety or medical accuracy
- **Compliance Considerations**: Any HIPAA or FDA implications
- **Testing Strategy**: How you plan to validate the change

### 2. Fork and Branch
```bash
git checkout -b feature/your-feature-name
git checkout -b fix/your-bug-fix
```

Branch naming convention:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `test/` - Testing improvements
- `compliance/` - Healthcare compliance updates

### 3. Development Standards

#### Code Quality
- **TypeScript**: All code must be properly typed
- **ESLint**: Code must pass all linting rules
- **Prettier**: Code must be formatted consistently
- **Tests**: All code must have appropriate test coverage

#### Healthcare-Specific Requirements
- **No PHI in Code**: Never hardcode patient information
- **Audit Logging**: All medical interactions must be logged
- **Error Handling**: Medical features need comprehensive error handling
- **Disclaimers**: Medical advice must include appropriate disclaimers

#### Required Checks
```bash
# Before committing
npm run pre-commit

# Before submitting PR
npm run pre-deploy
```

### 4. Testing Requirements

#### Minimum Coverage
- **General Code**: 70% coverage
- **Medical Features**: 85% coverage
- **Compliance Features**: 90% coverage

#### Test Types
```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# Healthcare compliance tests
npm run test:compliance

# Full test suite
npm run test
```

#### Medical AI Testing
- **PHARMA Framework Validation**: All medical responses tested
- **Confidence Score Testing**: Ensure appropriate thresholds
- **Safety Testing**: Test for harmful advice detection
- **Compliance Testing**: Validate HIPAA and FDA requirements

### 5. Documentation

#### Required Documentation
- **Code Comments**: Complex medical logic must be documented
- **API Documentation**: All medical endpoints need documentation
- **Compliance Notes**: Document any compliance considerations
- **Testing Documentation**: Explain healthcare-specific test cases

#### Documentation Standards
- Use JSDoc for function documentation
- Include examples for medical AI functions
- Document any security or privacy implications
- Link to relevant medical standards or guidelines

## 🔒 Security and Compliance

### Security Requirements
- **No Secrets**: Never commit API keys, passwords, or tokens
- **Encryption**: Sensitive data must be encrypted
- **Authentication**: Implement proper authentication and authorization
- **Input Validation**: Validate and sanitize all inputs

### HIPAA Compliance Checklist
- [ ] No PHI in logs or debugging output
- [ ] Proper access controls implemented
- [ ] Audit logging for data access
- [ ] Encryption for data at rest and in transit
- [ ] Appropriate user authentication

### Medical Safety Checklist
- [ ] Medical advice includes disclaimers
- [ ] Confidence scores implemented for AI responses
- [ ] Human review flags for critical decisions
- [ ] Error handling prevents harmful advice
- [ ] Sources and references provided for medical claims

## 📝 Pull Request Process

### PR Title Format
```
type(scope): description

Examples:
feat(medical): add PHARMA framework validation
fix(compliance): resolve HIPAA audit logging issue
docs(api): update medical endpoint documentation
```

### PR Description Template
```markdown
## Description
Brief description of changes

## Healthcare Impact
- Patient safety considerations
- Medical accuracy improvements
- Compliance implications

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Healthcare compliance tests passed
- [ ] Manual testing completed

## Compliance Checklist
- [ ] HIPAA compliance verified
- [ ] No PHI in code or logs
- [ ] Medical disclaimers included
- [ ] Audit logging implemented
- [ ] Security review completed

## Breaking Changes
List any breaking changes and migration steps
```

### Review Process
1. **Automated Checks**: CI/CD pipeline must pass
2. **Healthcare Review**: Medical safety assessment
3. **Security Review**: Security and compliance check
4. **Code Review**: Technical code review
5. **Testing Review**: Test coverage and quality check

### Merge Requirements
- ✅ All CI checks pass
- ✅ Healthcare compliance validated
- ✅ Security review approved
- ✅ At least 2 code review approvals
- ✅ Test coverage meets requirements

## 🧪 Healthcare-Specific Testing

### Medical AI Validation
```javascript
// Example medical AI test
test('should validate medical response with PHARMA framework', async () => {
  const response = await generateMedicalResponse(query);

  expect(response).toHaveMedicalValidation();
  expect(response.confidence).toBeGreaterThan(0.8);
  expect(response).toMeetFDARequirements();
  expect(response.content).toInclude('consult healthcare provider');
});
```

### Compliance Testing
```javascript
// Example HIPAA compliance test
test('should protect PHI in medical records', () => {
  const medicalRecord = generateTestRecord();

  expect(medicalRecord).toBeHIPAACompliant();
  expect(medicalRecord).not.toContainPHI();
  expect(medicalRecord.auditTrail).toBeDefined();
});
```

## 🎯 Development Guidelines

### Medical Features
- Always include confidence scores for AI-generated medical content
- Implement proper error handling for medical workflows
- Add appropriate disclaimers for medical advice
- Ensure human oversight capabilities for critical decisions

### Performance
- Medical responses should be optimized for speed (< 3 seconds)
- Implement proper caching for non-sensitive data
- Monitor and log performance metrics

### Accessibility
- Follow WCAG 2.1 AA standards
- Test with screen readers
- Ensure keyboard navigation works properly
- Consider users with disabilities in medical contexts

## 🛠️ Tools and Resources

### Development Tools
- **ESLint**: Code linting with healthcare-specific rules
- **Prettier**: Code formatting
- **Jest**: Testing framework with healthcare extensions
- **TypeScript**: Type safety for medical data structures

### Healthcare Tools
- **HIPAA Scanner**: `npm run compliance:scan`
- **PHARMA Validator**: `npm run medical:validate`
- **Security Auditor**: `npm run security:audit`

### Learning Resources
- [HIPAA Development Guide](./docs/compliance/hipaa-development.md)
- [Medical AI Best Practices](./docs/medical-ai/best-practices.md)
- [API Documentation](./docs/api/README.md)
- [Testing Guide](./docs/testing/healthcare-testing.md)

## ❓ Getting Help

### Community Support
- **GitHub Discussions**: For general questions and discussions
- **Issues**: For bug reports and feature requests
- **Wiki**: For detailed documentation and guides

### Professional Support
- **Medical Questions**: medical-review@vitalpath.healthcare
- **Compliance Questions**: compliance@vitalpath.healthcare
- **Security Questions**: security@vitalpath.healthcare
- **Technical Support**: engineering@vitalpath.healthcare

## 📜 Code of Conduct

### Our Pledge
We are committed to providing a welcoming and inclusive environment for all contributors, with special attention to the healthcare nature of our work and the responsibility that comes with handling medical information.

### Healthcare Ethics
- Patient privacy and safety are paramount
- All contributions must uphold medical ethical standards
- Accuracy and reliability are critical for medical features
- Transparency about AI limitations is required

### Standards
- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community and patients
- Show empathy towards other community members

## 🏆 Recognition

We appreciate all contributions to VITAL Path! Contributors will be recognized in:
- **Contributors list** in our documentation
- **Release notes** for significant contributions
- **Healthcare AI community** acknowledgments
- **Special recognition** for compliance and safety improvements

## 📄 License

By contributing to VITAL Path, you agree that your contributions will be licensed under the same license as the project. See [LICENSE](./LICENSE) for details.

---

Thank you for helping us build a safer, more effective healthcare AI platform!

For questions about contributing, please contact: contribute@vitalpath.healthcare