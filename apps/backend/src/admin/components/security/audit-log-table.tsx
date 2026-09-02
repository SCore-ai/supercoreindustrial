import { Table, Text } from "@medusajs/ui"

export const AuditLogTable = ({
  logs,
}: {
  logs: Array<Record<string, unknown>>
}) => (
  <Table>
    <Table.Header>
      <Table.Row>
        <Table.HeaderCell>When</Table.HeaderCell>
        <Table.HeaderCell>Actor</Table.HeaderCell>
        <Table.HeaderCell>Action</Table.HeaderCell>
        <Table.HeaderCell>Resource</Table.HeaderCell>
        <Table.HeaderCell>Summary</Table.HeaderCell>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {logs.map((log) => (
        <Table.Row key={String(log.id)}>
          <Table.Cell>
            <Text size="xsmall">
              {log.created_at
                ? new Date(String(log.created_at)).toLocaleString()
                : "—"}
            </Text>
          </Table.Cell>
          <Table.Cell>
            <Text size="xsmall">
              {String(log.actor_email || log.actor_id || log.actor_type)}
            </Text>
          </Table.Cell>
          <Table.Cell>
            <Text size="xsmall" className="font-mono">
              {String(log.action)}
            </Text>
          </Table.Cell>
          <Table.Cell>
            <Text size="xsmall">
              {String(log.resource_type)}
              {log.resource_id ? ` / ${String(log.resource_id).slice(-8)}` : ""}
            </Text>
          </Table.Cell>
          <Table.Cell>
            <Text size="xsmall" className="text-ui-fg-subtle">
              {String(log.summary || "—")}
            </Text>
          </Table.Cell>
        </Table.Row>
      ))}

      {!logs.length && (
        <Table.Row>
          <Table.Cell colSpan={5}>
            <Text size="small" className="text-ui-fg-subtle">
              No audit events recorded yet.
            </Text>
          </Table.Cell>
        </Table.Row>
      )}
    </Table.Body>
  </Table>
)
