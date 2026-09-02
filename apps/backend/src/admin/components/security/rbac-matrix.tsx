import { Badge, Table, Text } from "@medusajs/ui"
import { B2B_ROLE_PERMISSIONS } from "../../lib/security-types"

const ROLE_LABELS = {
  admin: "Company admin",
  approver: "Approver",
  buyer: "Buyer",
}

export const RbacMatrix = () => {
  const permissions = Array.from(
    new Set([
      ...B2B_ROLE_PERMISSIONS.admin,
      ...B2B_ROLE_PERMISSIONS.approver,
      ...B2B_ROLE_PERMISSIONS.buyer,
    ])
  ).sort()

  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Permission</Table.HeaderCell>
          {(Object.keys(B2B_ROLE_PERMISSIONS) as Array<keyof typeof B2B_ROLE_PERMISSIONS>).map(
            (role) => (
              <Table.HeaderCell key={role}>{ROLE_LABELS[role]}</Table.HeaderCell>
            )
          )}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {permissions.map((permission) => (
          <Table.Row key={permission}>
            <Table.Cell>
              <Text size="xsmall" className="font-mono">
                {permission}
              </Text>
            </Table.Cell>
            {(Object.keys(B2B_ROLE_PERMISSIONS) as Array<keyof typeof B2B_ROLE_PERMISSIONS>).map(
              (role) => (
                <Table.Cell key={role}>
                  {B2B_ROLE_PERMISSIONS[role].includes(permission) ? (
                    <Badge color="green" size="2xsmall">
                      Allowed
                    </Badge>
                  ) : (
                    <Text size="xsmall" className="text-ui-fg-subtle">
                      —
                    </Text>
                  )}
                </Table.Cell>
              )
            )}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
