# Pre-Merge Request Checklist

**Version:** 1.0.0
**Last Updated:** January 2026

---

## Before Opening a Merge Request

### Pre-Commit Complete
- [ ] All items from PRE_COMMIT_CHECKLIST.md verified

### Code Review Preparation
- [ ] Self-reviewed all changes
- [ ] Removed TODO comments or created issues for them
- [ ] No temporary or experimental code included
- [ ] Code is production-ready

### Testing
- [ ] All unit tests pass
- [ ] Integration tests pass (if applicable)
- [ ] Manual testing completed
- [ ] Tested on multiple browsers (if frontend changes)
- [ ] Mobile responsiveness verified (if UI changes)

### Documentation
- [ ] README updated with new features/changes
- [ ] API documentation current
- [ ] Architecture docs updated if needed
- [ ] Changelog entry added (if applicable)

### Database
- [ ] Migrations are reversible
- [ ] Schema.rb is updated
- [ ] Indexes added for new queries

### Performance
- [ ] No obvious performance regressions
- [ ] Database queries optimized
- [ ] Bundle size impact reviewed (frontend)

### Merge Request Quality
- [ ] Title clearly describes the change
- [ ] Description includes context and motivation
- [ ] Screenshots included (if UI changes)
- [ ] Related issues linked
- [ ] Appropriate labels applied

---

## MR Description Template

```markdown
## Summary
Brief description of what this MR does.

## Changes
- Change 1
- Change 2

## Testing
Describe how this was tested.

## Screenshots
(If applicable)

## Related Issues
Closes #XXX
```
