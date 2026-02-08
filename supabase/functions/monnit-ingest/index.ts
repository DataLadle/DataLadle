import { createClient } from '@supabase/supabase-js'

Deno.serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    const body = await req.json()
    
    // 1. EXTRACT DATA
    // Handle Case Sensitivity (Monnit sometimes varies)
    const gateway = body.gatewayMessage || body.GatewayMessage || {}
    const messages = body.sensorMessages || body.SensorMessages || []

    console.log(`Processing ${messages.length} messages from Gateway ${gateway.gatewayID || 'Unknown'}`)

    // 2. SYNC GATEWAY (If present in JSON)
    if (gateway.gatewayID) {
       await supabase.from('gateways').upsert({
         id: gateway.gatewayID,
         name: gateway.gatewayName,
         network_id: gateway.networkID,
         signal_strength: gateway.signalStrength,
         battery_level: gateway.batteryLevel,
         last_seen: gateway.date
       })
    }

    // 3. PROCESS SENSORS
    for (const msg of messages) {
      // Map JSON fields to variables
      // Your JSON uses "plotValues" (plural), we check both to be safe
      const dataVal = msg.dataValue || msg.displayData
      const plotVal = msg.plotValues || msg.plotValue
      
      // A. UPDATE LIVE STATUS
      const { error: sensorError } = await supabase.from('sensors').upsert({
        id: msg.sensorID,
        gateway_id: gateway.gatewayID, // Links sensor to the gateway above
        name: msg.sensorName,
        application_id: msg.applicationID,
        last_data_value: dataVal,
        last_plot_value: plotVal,
        battery_level: msg.batteryLevel,
        signal_strength: msg.signalStrength,
        voltage: msg.voltage,
        state: msg.state,
        last_seen: msg.messageDate
      })

      if (sensorError) console.error(`Error updating sensor ${msg.sensorID}:`, sensorError)

      // B. INSERT HISTORY RECORD
      const { error: historyError } = await supabase.from('sensor_readings').insert({
        sensor_id: msg.sensorID,
        data_value: dataVal,
        plot_value: parseFloat(plotVal), // Converts "74.66" string to number
        signal_strength: msg.signalStrength,
        voltage: msg.voltage,
        state: msg.state,
        recorded_at: msg.messageDate
      })

      if (historyError) console.error(`Error inserting history for ${msg.sensorID}:`, historyError)
    }

    return new Response(JSON.stringify({ success: true }), { 
      headers: { "Content-Type": "application/json" },
      status: 200 
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { "Content-Type": "application/json" },
      status: 500 
    })
  }
})