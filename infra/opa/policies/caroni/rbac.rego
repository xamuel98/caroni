package caroni

import rego.v1

# Role → permission check against the app-managed matrix (data.role_permissions).
rbac_ok if {
	perm := input.action
	some role in input.subject.roles
	perm in data.role_permissions[role]
}
