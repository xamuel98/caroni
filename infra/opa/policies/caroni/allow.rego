package caroni

import rego.v1

default allow := false
default reasons := set()

allow if {
	rbac_ok
}

reasons contains "rbac.denied: role lacks required permission" if not rbac_ok

decision := {
	"allow": allow,
	"reasons": [r | some r in reasons],
	"obligations": [],
	"matchedPolicy": "caroni/allow",
}
