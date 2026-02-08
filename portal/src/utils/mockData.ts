/**
 * Mock data for Data Ladle dashboard
 * Schema aligned with Monnit API / Webhook JSON
 */

export type SensorStatus = "healthy" | "alert" | "offline";

export type AlertType = "Temperature" | "Battery" | "Signal" | "Humidity";
export type AlertStatus = "Active" | "Acknowledged" | "Resolved";

export interface Alert {
  id: string;
  sensorId: string;
  ruleId: string;
  type: AlertType;
  value: string;
  threshold: string;
  status: AlertStatus;
  timestamp: string;
}

export type UserRole = "client" | "contractor" | "admin" | "superuser";

export type PlanType = "basic" | "premium";

export interface User {
  id: string;
  name: string;
  role: UserRole;
  company: string;
  avatar?: string;
  email?: string;
  phone?: string;
  clientId?: string; // for client-role users
  planType?: PlanType; // basic = no Escalate; premium = full Managed Support
}

export type ClientStatus = "Active" | "Past Due";

export interface Client {
  id: string;
  name: string;
  status: ClientStatus;
}

export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Escalated";
export type TicketPriority = "Low" | "High" | "Critical";
export type TimelineSender = "Client" | "Data Ladle" | "Contractor";

export interface TimelineMessage {
  sender: TimelineSender;
  text: string;
  timestamp: string;
}

export type TicketDispatchStatus = "Unassigned" | "Dispatched" | "Monitoring";

export interface Ticket {
  id: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  sensorId: string;
  locationId: string;
  assignedTo: string;
  assignedToUserId?: string | null; // null = unassigned
  ticketDispatchStatus?: TicketDispatchStatus; // for global feed filter
  timeline: TimelineMessage[];
  lastUpdated: string;
}

export const USER_IDS = {
  FACILITY_MANAGER: "usr-facility-manager",
  PREMIUM_CLIENT: "usr-premium-client",
  JOE_THE_TECH: "usr-joe-the-tech",
  SUPER_ADMIN: "usr-super-admin",
} as const;

export const CLIENT_IDS = {
  ACME: "client-acme",
  BETA: "client-beta",
  GAMMA: "client-gamma",
  DELTA: "client-delta",
  EPSILON: "client-epsilon",
  ZETA: "client-zeta",
  ETA: "client-eta",
  THETA: "client-theta",
  IOTA: "client-iota",
  KAPPA: "client-kappa",
  LAMBDA: "client-lambda",
  MU: "client-mu",
} as const;

export const MOCK_CLIENTS: Client[] = [
  { id: CLIENT_IDS.ACME, name: "Acme Corp", status: "Active" },
  { id: CLIENT_IDS.BETA, name: "Beta Industries", status: "Active" },
  { id: CLIENT_IDS.GAMMA, name: "Gamma Foods", status: "Past Due" },
  { id: CLIENT_IDS.DELTA, name: "Delta Logistics", status: "Active" },
  { id: CLIENT_IDS.EPSILON, name: "Epsilon Pharma", status: "Active" },
  { id: CLIENT_IDS.ZETA, name: "Zeta Manufacturing", status: "Active" },
  { id: CLIENT_IDS.ETA, name: "Eta Retail", status: "Active" },
  { id: CLIENT_IDS.THETA, name: "Theta Hospitality", status: "Past Due" },
  { id: CLIENT_IDS.IOTA, name: "Iota Tech", status: "Active" },
  { id: CLIENT_IDS.KAPPA, name: "Kappa Energy", status: "Active" },
  { id: CLIENT_IDS.LAMBDA, name: "Lambda Health", status: "Active" },
  { id: CLIENT_IDS.MU, name: "Mu Foods", status: "Active" },
];

export const MOCK_USERS: User[] = [
  { id: USER_IDS.FACILITY_MANAGER, name: "Facility Manager", role: "client", company: "Acme Corp", email: "client@acme.com", clientId: CLIENT_IDS.ACME, planType: "basic" },
  { id: USER_IDS.PREMIUM_CLIENT, name: "Premium Client", role: "client", company: "Acme Corp", email: "premium@acme.com", clientId: CLIENT_IDS.ACME, planType: "premium" },
  { id: USER_IDS.JOE_THE_TECH, name: "Joe The Tech", role: "contractor", company: "Data Ladle Services", email: "joe.tech@dataladle.com", phone: "555-123-4567" },
  { id: USER_IDS.SUPER_ADMIN, name: "Super Admin", role: "superuser", company: "Data Ladle", email: "admin@dataladle.com" },
];

export type AssetType = "Refrigeration" | "HVAC" | "Power" | "Plumbing";
export type AssetStatus = "Operational" | "Maintenance Required" | "Out of Service";

export interface Asset {
  id: string;
  name: string;
  type: AssetType;
  locationId: string;
  assignedSensors: string[];
  status: AssetStatus;
  details: {
    make: string;
    model: string;
    serialNumber: string;
    installDate: string;
  };
}

export type GatewayType = "Ethernet" | "Cellular 4G" | "WiFi";
export type GatewayStatus = "Online" | "Offline" | "Warning";

/** Gateway - belongs to a Location (Monnit-aligned + locationId) */
export interface Gateway {
  id: string;
  physicalId: string;
  name: string;
  networkId: string;
  locationId: string;
  type: GatewayType;
  signalStrength?: number; // 0-100 (Monnit) or dBm
  batteryLevel?: number;
  lastSeen: string;
  sensorCount: number;
  status: GatewayStatus;
  pendingChange?: boolean;
}

export interface RuleDefinition {
  id: string;
  name: string;
  condition: string;
  threshold: string;
  triggerCount: number;
  assignedSensorCount: number;
  paused?: boolean;
}

/** Location (Site) - top of hierarchy */
export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  image: string;
  clientId: string; // multi-tenancy
  stats: {
    totalSensors: number;
    alerts: number;
  };
}

/** @deprecated Use Location */
export type Building = Location;

export interface HistoryPoint {
  timestamp: string;
  temperature: number;
}

/** Sensor - Monnit Webhook schema aligned. Belongs to a Gateway. */
export interface MonnitSensor {
  id: string;
  sensorId: string;
  gatewayId: string;
  dataMessageGUID?: string;
  name: string;
  type: string;
  location: string;
  applicationId: string;
  state: number;
  signalStrength: number; // 0-100 Monnit scale (higher = better)
  voltage: number;
  battery: number; // 0-100
  data: string;
  displayData: string;
  plotValue: string;
  messageDate: string;
  metNotificationRequirements: boolean;
  pendingChange?: boolean;
  thresholdMin?: string;
  thresholdMax?: string;
  heartbeat?: string;
  checkInterval?: string;
  history: HistoryPoint[];
}

export const LOCATION_IDS = {
  HEADQUARTERS: "loc-headquarters",
  COLD_STORAGE_A: "loc-cold-storage-a",
  SERVER_FARM: "loc-server-farm",
  GAMMA_DISTRIBUTION: "loc-gamma-distribution",
} as const;

export const BUILDING_IDS = LOCATION_IDS;

export const MOCK_LOCATIONS: Location[] = [
  {
    id: LOCATION_IDS.HEADQUARTERS,
    name: "Headquarters",
    address: "100 Tech Blvd",
    city: "Austin",
    state: "TX",
    image: "https://placehold.co/400x160/1e293b/64748b?text=Headquarters",
    clientId: CLIENT_IDS.ACME,
    stats: { totalSensors: 3, alerts: 0 },
  },
  {
    id: LOCATION_IDS.COLD_STORAGE_A,
    name: "Cold Storage A",
    address: "50 Industrial Way",
    city: "Dallas",
    state: "TX",
    image: "https://placehold.co/400x160/1e293b/64748b?text=Cold+Storage",
    clientId: CLIENT_IDS.ACME,
    stats: { totalSensors: 2, alerts: 2 },
  },
  {
    id: LOCATION_IDS.SERVER_FARM,
    name: "Server Farm",
    address: "12 Data Dr",
    city: "Houston",
    state: "TX",
    image: "https://placehold.co/400x160/1e293b/64748b?text=Server+Farm",
    clientId: CLIENT_IDS.BETA,
    stats: { totalSensors: 1, alerts: 1 },
  },
  {
    id: LOCATION_IDS.GAMMA_DISTRIBUTION,
    name: "Gamma Distribution",
    address: "88 Commerce Rd",
    city: "San Antonio",
    state: "TX",
    image: "https://placehold.co/400x160/1e293b/64748b?text=Gamma",
    clientId: CLIENT_IDS.GAMMA,
    stats: { totalSensors: 0, alerts: 0 },
  },
];

export const MOCK_BUILDINGS = MOCK_LOCATIONS;

function generate24hHistory(
  baseTemp: number,
  variance: number
): HistoryPoint[] {
  const points: HistoryPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const date = new Date(now);
    date.setHours(date.getHours() - i, 0, 0, 0);
    const hourOffset = 23 - i;
    const fluctuation = Math.sin(hourOffset * 0.3) * variance + Math.random() * 1.5;
    const temp = Math.round((baseTemp + fluctuation) * 10) / 10;
    points.push({ timestamp: date.toISOString(), temperature: temp });
  }
  return points;
}

export const MOCK_SENSORS: MonnitSensor[] = [
  {
    id: "MON-001",
    sensorId: "55678",
    gatewayId: "GW-101",
    dataMessageGUID: "guid-001",
    name: "Temperature - Server Room A",
    type: "Temperature",
    location: "Floor 2, Server Room",
    applicationId: "101",
    state: 2,
    signalStrength: 76,
    voltage: 3.12,
    battery: 87,
    data: "72",
    displayData: "72°F",
    plotValue: "72",
    messageDate: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    metNotificationRequirements: false,
    thresholdMin: "65",
    thresholdMax: "80",
    heartbeat: "10 min",
    checkInterval: "5 min",
    history: generate24hHistory(72, 3),
  },
  {
    id: "MON-006",
    sensorId: "55892",
    gatewayId: "GW-102",
    dataMessageGUID: "guid-006",
    name: "Temperature - Freezer",
    type: "Temperature",
    location: "Freezer Unit 1",
    applicationId: "101",
    state: 18,
    signalStrength: 58,
    voltage: 3.01,
    battery: 61,
    data: "38",
    displayData: "38°F",
    plotValue: "38",
    messageDate: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
    metNotificationRequirements: true,
    thresholdMin: "28",
    thresholdMax: "35",
    heartbeat: "10 min",
    checkInterval: "5 min",
    history: generate24hHistory(36, 4),
  },
  {
    id: "MON-002",
    sensorId: "55901",
    gatewayId: "GW-102",
    dataMessageGUID: "guid-002",
    name: "Humidity - Cold Storage",
    type: "Humidity",
    location: "Warehouse Floor",
    applicationId: "102",
    state: 18,
    signalStrength: 44,
    voltage: 2.71,
    battery: 34,
    data: "92",
    displayData: "92%",
    plotValue: "92",
    messageDate: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    metNotificationRequirements: true,
    thresholdMin: "20",
    thresholdMax: "80",
    heartbeat: "15 min",
    checkInterval: "10 min",
    history: generate24hHistory(68, 8),
  },
  {
    id: "MON-003",
    sensorId: "55421",
    gatewayId: "GW-101",
    dataMessageGUID: "guid-003",
    name: "Door Contact - Main Entry",
    type: "Door/Window",
    location: "Lobby, Main Entry",
    applicationId: "103",
    state: 2,
    signalStrength: 90,
    voltage: 3.18,
    battery: 91,
    data: "closed",
    displayData: "Closed",
    plotValue: "1",
    messageDate: new Date(Date.now() - 1 * 60 * 1000).toISOString(),
    metNotificationRequirements: false,
    heartbeat: "5 min",
    checkInterval: "1 min",
    history: generate24hHistory(70, 2),
  },
  {
    id: "MON-004",
    sensorId: "56123",
    gatewayId: "GW-103",
    dataMessageGUID: "guid-004",
    name: "Temperature - HVAC Zone 3",
    type: "Temperature",
    location: "Rack Hall B",
    applicationId: "101",
    state: 0,
    signalStrength: 10,
    voltage: 2.42,
    battery: 12,
    data: "--",
    displayData: "N/A",
    plotValue: "",
    messageDate: new Date(Date.now() - 127 * 60 * 1000).toISOString(),
    metNotificationRequirements: false,
    thresholdMin: "65",
    thresholdMax: "85",
    heartbeat: "120 min",
    checkInterval: "10 min",
    history: generate24hHistory(71, 4),
  },
  {
    id: "MON-005",
    sensorId: "55734",
    gatewayId: "GW-101",
    dataMessageGUID: "guid-005",
    name: "Water Leak - Basement",
    type: "Water Leak",
    location: "Basement",
    applicationId: "104",
    state: 2,
    signalStrength: 56,
    voltage: 2.94,
    battery: 65,
    data: "dry",
    displayData: "Dry",
    plotValue: "0",
    messageDate: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
    metNotificationRequirements: false,
    heartbeat: "10 min",
    checkInterval: "5 min",
    history: generate24hHistory(69, 2),
  },
];

export const MOCK_GATEWAYS: Gateway[] = [
  {
    id: "GW-101",
    physicalId: "987654",
    name: "Warehouse Main Hub",
    networkId: "NET-ACME-01",
    locationId: LOCATION_IDS.HEADQUARTERS,
    type: "Ethernet",
    lastSeen: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    sensorCount: 3,
    status: "Online",
  },
  {
    id: "GW-102",
    physicalId: "987655",
    name: "Cold Storage Cellular Hub",
    networkId: "NET-ACME-01",
    locationId: LOCATION_IDS.COLD_STORAGE_A,
    type: "Cellular 4G",
    signalStrength: 16,
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    sensorCount: 2,
    status: "Warning",
  },
  {
    id: "GW-103",
    physicalId: "987656",
    name: "Server Farm WiFi Hub",
    networkId: "NET-ACME-01",
    locationId: LOCATION_IDS.SERVER_FARM,
    type: "WiFi",
    signalStrength: 10,
    lastSeen: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    sensorCount: 1,
    status: "Offline",
  },
];

export const RULE_IDS = {
  CRITICAL_HEAT: "RUL-critical-heat",
  LOW_BATTERY: "RUL-low-battery",
  WEAK_SIGNAL: "RUL-weak-signal",
  HUMIDITY_HIGH: "RUL-humidity-high",
} as const;

export const SENSOR_RULE_ASSIGNMENTS: Record<string, string[]> = {
  "MON-001": [RULE_IDS.CRITICAL_HEAT, RULE_IDS.LOW_BATTERY],
  "MON-002": [RULE_IDS.HUMIDITY_HIGH],
  "MON-003": [RULE_IDS.LOW_BATTERY],
  "MON-004": [RULE_IDS.LOW_BATTERY, RULE_IDS.WEAK_SIGNAL],
  "MON-005": [RULE_IDS.LOW_BATTERY],
  "MON-006": [RULE_IDS.CRITICAL_HEAT, RULE_IDS.LOW_BATTERY],
};

export const MOCK_RULE_DEFINITIONS: RuleDefinition[] = [
  { id: RULE_IDS.CRITICAL_HEAT, name: "Critical Heat", condition: "Temp > 40°F", threshold: "40°F", triggerCount: 12, assignedSensorCount: 3, paused: false },
  { id: RULE_IDS.LOW_BATTERY, name: "Low Battery", condition: "Battery < 20%", threshold: "20%", triggerCount: 8, assignedSensorCount: 6, paused: false },
  { id: RULE_IDS.WEAK_SIGNAL, name: "Weak Signal", condition: "Signal > -80 dBm", threshold: "-80 dBm", triggerCount: 5, assignedSensorCount: 6, paused: false },
  { id: RULE_IDS.HUMIDITY_HIGH, name: "Humidity High", condition: "Humidity > 80%", threshold: "80%", triggerCount: 4, assignedSensorCount: 1, paused: false },
];

export const MOCK_ASSETS: Asset[] = [
  { id: "AST-001", name: "Walk-in Freezer B", type: "Refrigeration", locationId: LOCATION_IDS.COLD_STORAGE_A, assignedSensors: ["MON-006", "MON-002"], status: "Operational", details: { make: "Tru-Cold", model: "TC-24WF", serialNumber: "TC24-8847", installDate: "2023-03-15" } },
  { id: "AST-002", name: "Sub-Zero Fridge", type: "Refrigeration", locationId: LOCATION_IDS.HEADQUARTERS, assignedSensors: ["MON-001"], status: "Operational", details: { make: "Sub-Zero", model: "BI-36U", serialNumber: "SZ-2024-1129", installDate: "2024-01-20" } },
  { id: "AST-003", name: "HVAC Rack Cooling", type: "HVAC", locationId: LOCATION_IDS.SERVER_FARM, assignedSensors: ["MON-004"], status: "Maintenance Required", details: { make: "Liebert", model: "DS-320", serialNumber: "LBT-DS320-5542", installDate: "2022-08-10" } },
  { id: "AST-004", name: "Backup Generator", type: "Power", locationId: LOCATION_IDS.HEADQUARTERS, assignedSensors: ["MON-003"], status: "Operational", details: { make: "Kohler", model: "20RES", serialNumber: "KOH-20R-9912", installDate: "2021-11-05" } },
  { id: "AST-005", name: "Basement Sump Pump", type: "Plumbing", locationId: LOCATION_IDS.HEADQUARTERS, assignedSensors: ["MON-005"], status: "Operational", details: { make: "Zoeller", model: "M63", serialNumber: "ZOE-M63-4471", installDate: "2023-06-22" } },
];

const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000);
const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000);

export const MOCK_ALERTS: Alert[] = [
  { id: "ALT-001", sensorId: "MON-006", ruleId: RULE_IDS.CRITICAL_HEAT, type: "Temperature", value: "38°F", threshold: "> 35°F", status: "Active", timestamp: twoHoursAgo.toISOString() },
  { id: "ALT-002", sensorId: "MON-002", ruleId: RULE_IDS.HUMIDITY_HIGH, type: "Humidity", value: "92%", threshold: "> 80%", status: "Active", timestamp: threeHoursAgo.toISOString() },
  { id: "ALT-003", sensorId: "MON-004", ruleId: RULE_IDS.LOW_BATTERY, type: "Battery", value: "12%", threshold: "< 20%", status: "Active", timestamp: oneHourAgo.toISOString() },
  { id: "ALT-004", sensorId: "MON-004", ruleId: RULE_IDS.WEAK_SIGNAL, type: "Signal", value: "-95 dBm", threshold: "> -80 dBm", status: "Acknowledged", timestamp: fourHoursAgo.toISOString() },
  { id: "ALT-005", sensorId: "MON-006", ruleId: RULE_IDS.CRITICAL_HEAT, type: "Temperature", value: "42°F", threshold: "> 40°F", status: "Resolved", timestamp: twoDaysAgo.toISOString() },
  { id: "ALT-006", sensorId: "MON-002", ruleId: RULE_IDS.HUMIDITY_HIGH, type: "Humidity", value: "85%", threshold: "> 80%", status: "Resolved", timestamp: twoDaysAgo.toISOString() },
];

/** Convert Monnit signalStrength (0-100) to approx dBm */
export function signalStrengthToDbm(s: number): number {
  return Math.round(-110 + (s / 100) * 50);
}

/** Display-friendly sensor data for UI components */
export function getSensorDisplay(sensor: MonnitSensor) {
  return {
    lastReading: sensor.displayData,
    batteryPercent: sensor.battery,
    signalStrengthDbm: signalStrengthToDbm(sensor.signalStrength),
    status: getSensorStatus(sensor),
    lastSeenMinutes: Math.floor(
      (Date.now() - new Date(sensor.messageDate).getTime()) / 60000
    ),
    lastSeenTimestamp: sensor.messageDate,
    value: sensor.data,
    unit: sensor.plotValue ? "" : "",
  };
}

/** Derive sensor status from Monnit state and battery */
export function getSensorStatus(sensor: MonnitSensor): SensorStatus {
  const lastSeenMs = Date.now() - new Date(sensor.messageDate).getTime();
  if (lastSeenMs > 30 * 60 * 1000) return "offline";
  if (sensor.metNotificationRequirements || sensor.battery < 20 || sensor.signalStrength < 20) return "alert";
  return "healthy";
}

export function getLocationById(id: string): Location | undefined {
  return MOCK_LOCATIONS.find((l) => l.id === id);
}

export function getGatewayById(id: string): Gateway | undefined {
  return MOCK_GATEWAYS.find((g) => g.id === id);
}

export function getSensorById(id: string): MonnitSensor | undefined {
  return MOCK_SENSORS.find((s) => s.id === id);
}

export function getSensorsByLocation(locationId: string): MonnitSensor[] {
  const gatewayIds = new Set(
    MOCK_GATEWAYS.filter((g) => g.locationId === locationId).map((g) => g.id)
  );
  return MOCK_SENSORS.filter((s) => gatewayIds.has(s.gatewayId));
}

export function getGatewaysByLocation(locationId: string): Gateway[] {
  return MOCK_GATEWAYS.filter((g) => g.locationId === locationId);
}

export function getSensorsByGateway(gatewayId: string): MonnitSensor[] {
  return MOCK_SENSORS.filter((s) => s.gatewayId === gatewayId);
}

export function getSensorLocationId(sensor: MonnitSensor): string | null {
  return getGatewayById(sensor.gatewayId)?.locationId ?? null;
}

export type RecentActivityType = "alert" | "ticket" | "rule";

export interface RecentActivityItem {
  id: string;
  type: RecentActivityType;
  title: string;
  timestamp: string;
  meta?: string;
  link?: string;
}

export function getLocationDetails(locationId: string) {
  const location = getLocationById(locationId) ?? null;
  const sensors = getSensorsByLocation(locationId);
  const gateways = getGatewaysByLocation(locationId);
  const assets = MOCK_ASSETS.filter((a) => a.locationId === locationId);
  const sensorIds = new Set(sensors.map((s) => s.id));
  const tickets = MOCK_TICKETS.filter((t) => t.locationId === locationId);
  const alerts = MOCK_ALERTS.filter((a) => sensorIds.has(a.sensorId));

  const activeAlertsCount = alerts.filter((a) => a.status === "Active").length;
  const openTicketsCount = tickets.filter((t) => t.status !== "Resolved").length;
  const onlineGatewaysCount = gateways.filter((g) => g.status === "Online").length;
  const healthySensors = sensors.filter((s) => getSensorStatus(s) === "healthy").length;
  const siteHealth = sensors.length > 0 ? Math.round((healthySensors / sensors.length) * 100) : 100;

  const activityItems: RecentActivityItem[] = [
    ...alerts.map((a) => {
      const sensor = getSensorById(a.sensorId);
      return { id: a.id, type: "alert" as const, title: `${a.type} ${a.status}: ${sensor?.name ?? a.sensorId}`, timestamp: a.timestamp, meta: `${a.value} (threshold: ${a.threshold})`, link: `/sensors/${a.sensorId}` };
    }),
    ...tickets.map((t) => ({ id: `ticket-${t.id}`, type: "ticket" as const, title: `${t.status}: ${t.title}`, timestamp: t.lastUpdated, meta: t.assignedTo, link: `/tickets/${t.id}` })),
  ];
  activityItems.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return {
    building: location,
    location,
    sensors,
    assets,
    gateways,
    tickets,
    alerts,
    recentActivity: activityItems.slice(0, 5),
    siteHealth,
    activeAlertsCount,
    openTicketsCount,
    onlineGatewaysCount,
    totalGatewaysCount: gateways.length,
  };
}

export function getUserById(id: string): User | undefined {
  return MOCK_USERS.find((u) => u.id === id);
}

export function getTicketsByContractor(userId: string): Ticket[] {
  return MOCK_TICKETS.filter((t) => t.assignedToUserId === userId);
}

export function getAvailableTickets(): Ticket[] {
  return MOCK_TICKETS.filter((t) => t.assignedToUserId == null || t.assignedToUserId === "");
}

export function getClientById(id: string): Client | undefined {
  return MOCK_CLIENTS.find((c) => c.id === id);
}

export function getLocationsByClient(clientId: string): Location[] {
  return MOCK_LOCATIONS.filter((l) => l.clientId === clientId);
}

function getLocationIdsByClient(clientId: string): Set<string> {
  return new Set(getLocationsByClient(clientId).map((l) => l.id));
}

export function getTicketsForClient(clientId: string): Ticket[] {
  const locIds = getLocationIdsByClient(clientId);
  return MOCK_TICKETS.filter((t) => locIds.has(t.locationId));
}

export function getSensorsForClient(clientId: string): MonnitSensor[] {
  const locIds = getLocationIdsByClient(clientId);
  const gwIds = new Set(
    MOCK_GATEWAYS.filter((g) => locIds.has(g.locationId)).map((g) => g.id)
  );
  return MOCK_SENSORS.filter((s) => gwIds.has(s.gatewayId));
}

export interface ClientWithStats extends Client {
  sensorCount: number;
  activeTickets: number;
}

export function getClientsWithStats(): ClientWithStats[] {
  return MOCK_CLIENTS.map((client) => {
    const sensors = getSensorsForClient(client.id);
    const tickets = getTicketsForClient(client.id);
    const activeTickets = tickets.filter((t) => t.status !== "Resolved").length;
    return {
      ...client,
      sensorCount: sensors.length,
      activeTickets,
    };
  });
}

export function getGlobalTickets(filter?: TicketDispatchStatus): Ticket[] {
  const open = MOCK_TICKETS.filter((t) => t.status !== "Resolved");
  if (!filter) return open;
  return open.filter((t) => (t.ticketDispatchStatus ?? "Unassigned") === filter);
}

export function getCriticalIncidents(): Alert[] {
  return MOCK_ALERTS.filter((a) => a.status === "Active");
}

export interface ActiveContractorInfo {
  user: User;
  locationName: string;
  ticketId: string;
}

export function getActiveContractors(): ActiveContractorInfo[] {
  const result: ActiveContractorInfo[] = [];
  const inProgress = MOCK_TICKETS.filter(
    (t) => t.status === "In Progress" && t.assignedToUserId
  );
  for (const t of inProgress) {
    const user = t.assignedToUserId ? getUserById(t.assignedToUserId) : null;
    const location = getLocationById(t.locationId);
    if (user && location) {
      result.push({
        user,
        locationName: location.name,
        ticketId: t.id,
      });
    }
  }
  return result;
}

export function getGlobalSensorHealth(): {
  total: number;
  healthy: number;
  percent: number;
} {
  const total = MOCK_SENSORS.length;
  const healthy = MOCK_SENSORS.filter((s) => getSensorStatus(s) === "healthy").length;
  return {
    total,
    healthy,
    percent: total > 0 ? Math.round((healthy / total) * 100) : 100,
  };
}

export function getRuleById(id: string): RuleDefinition | undefined {
  return MOCK_RULE_DEFINITIONS.find((r) => r.id === id);
}

export type TicketDetailTimelineEvent =
  | { type: "rule_triggered"; ruleName: string; timestamp: string }
  | { type: "ticket_created"; timestamp: string }
  | { type: "dispatched"; contractorName: string; timestamp: string }
  | { type: "comment"; sender: TimelineSender; text: string; timestamp: string };

export interface TicketDetails {
  ticket: Ticket;
  sensor: MonnitSensor | null;
  location: Location | null;
  asset: Asset | null;
  contractor: User | null;
  triggeringAlert: Alert | null;
  rule: RuleDefinition | null;
  timeline: TicketDetailTimelineEvent[];
}

export function getTicketDetails(id: string): TicketDetails | null {
  const ticket = MOCK_TICKETS.find((t) => t.id === id);
  if (!ticket) return null;

  const sensor = getSensorById(ticket.sensorId) ?? null;
  const location = getLocationById(ticket.locationId) ?? null;
  const asset = MOCK_ASSETS.find((a) => a.assignedSensors.includes(ticket.sensorId)) ?? null;
  const contractor = ticket.assignedToUserId ? getUserById(ticket.assignedToUserId) ?? null : null;

  const sensorAlerts = MOCK_ALERTS.filter((a) => a.sensorId === ticket.sensorId).sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
  const triggeringAlert = sensorAlerts.find((a) => a.status === "Active") ?? sensorAlerts[sensorAlerts.length - 1] ?? null;
  const rule = triggeringAlert ? getRuleById(triggeringAlert.ruleId) ?? null : null;

  const timeline: TicketDetailTimelineEvent[] = [];
  if (triggeringAlert) {
    timeline.push({
      type: "rule_triggered",
      ruleName: rule?.name ?? "Alert",
      timestamp: triggeringAlert.timestamp,
    });
    const ticketCreatedTime = new Date(triggeringAlert.timestamp).getTime() + 5 * 60 * 1000;
    timeline.push({
      type: "ticket_created",
      timestamp: new Date(ticketCreatedTime).toISOString(),
    });
  } else {
    timeline.push({
      type: "ticket_created",
      timestamp: ticket.timeline[0]?.timestamp ?? ticket.lastUpdated,
    });
  }
  if (contractor && ticket.timeline.length > 0) {
    const dispatchMsg = ticket.timeline.find((m) => m.sender === "Data Ladle" && m.text.toLowerCase().includes("assign"));
    if (dispatchMsg) {
      timeline.push({ type: "dispatched", contractorName: contractor.name, timestamp: dispatchMsg.timestamp });
    }
  }
  ticket.timeline.forEach((m) => {
    timeline.push({ type: "comment", sender: m.sender, text: m.text, timestamp: m.timestamp });
  });
  timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return {
    ticket,
    sensor,
    location,
    asset,
    contractor,
    triggeringAlert,
    rule,
    timeline,
  };
}

export function getSensorDetails(id: string) {
  const sensor = getSensorById(id) ?? null;
  const assignedRuleIds = sensor ? (SENSOR_RULE_ASSIGNMENTS[sensor.id] ?? []) : [];
  return { sensor, history: sensor?.history ?? [], assignedRuleIds };
}

export const MOCK_TICKETS: Ticket[] = [
  { id: "TKT-001", title: "Freezer Temperature Alert - Cold Storage A", status: "In Progress", priority: "High", sensorId: "MON-006", locationId: LOCATION_IDS.COLD_STORAGE_A, assignedTo: "Joe The Tech", assignedToUserId: USER_IDS.JOE_THE_TECH, ticketDispatchStatus: "Dispatched", lastUpdated: twoHoursAgo.toISOString(), timeline: [{ sender: "Client", text: "We received an alert that our freezer temp sensor is reading high.", timestamp: twoDaysAgo.toISOString() }, { sender: "Data Ladle", text: "Ticket created. Assigning to HVAC contractor.", timestamp: twoDaysAgo.toISOString() }, { sender: "Contractor", text: "On my way. ETA 45 mins.", timestamp: fourHoursAgo.toISOString() }] },
  { id: "TKT-002", title: "HVAC Zone 3 Offline - Server Farm", status: "Open", priority: "Critical", sensorId: "MON-004", locationId: LOCATION_IDS.SERVER_FARM, assignedTo: "Unassigned", assignedToUserId: null, ticketDispatchStatus: "Unassigned", lastUpdated: oneHourAgo.toISOString(), timeline: [{ sender: "Data Ladle", text: "Sensor MON-004 has been offline for 2+ hours.", timestamp: oneHourAgo.toISOString() }] },
  { id: "TKT-003", title: "Humidity Alert - Cold Storage", status: "Resolved", priority: "Low", sensorId: "MON-002", locationId: LOCATION_IDS.COLD_STORAGE_A, assignedTo: "Joe The Tech", assignedToUserId: USER_IDS.JOE_THE_TECH, ticketDispatchStatus: "Monitoring", lastUpdated: thirtyMinsAgo.toISOString(), timeline: [{ sender: "Client", text: "Humidity spiked in cold storage.", timestamp: twoDaysAgo.toISOString() }, { sender: "Contractor", text: "Door openings cause temporary humidity rise. No action needed.", timestamp: thirtyMinsAgo.toISOString() }] },
];
