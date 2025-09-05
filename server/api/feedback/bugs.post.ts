export default eventHandler(async (event) => {
  try {
    // Check if request method is POST
    if (getMethod(event) !== 'POST') {
      throw createError({
        statusCode: 405,
        statusMessage: 'Method Not Allowed'
      })
    }

    // Check Authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Unauthorized - Missing or invalid authorization header'
      })
    }

    // Extract token (you can add token validation logic here)
    const token = authHeader.replace('Bearer ', '')
    
    // Parse multipart form data
    const formData = await readMultipartFormData(event)
    
    if (!formData) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No form data received'
      })
    }

    // Extract form fields
    let title = ''
    let description = ''
    let screenshot = null

    for (const item of formData) {
      if (item.name === 'title') {
        title = item.data.toString()
      } else if (item.name === 'description') {
        description = item.data.toString()
      } else if (item.name === 'screenshot') {
        screenshot = {
          filename: item.filename,
          type: item.type,
          data: item.data
        }
      }
    }

    // Validate required fields
    if (!title || !description) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title and description are required'
      })
    }

    // Here you would typically:
    // 1. Save the bug report to a database
    // 2. Save the screenshot file if provided
    // 3. Send notification emails
    // 4. Generate a ticket ID
    
    // For now, we'll simulate processing and return success
    const bugReport = {
      id: Math.floor(Math.random() * 10000),
      title,
      description,
      hasScreenshot: !!screenshot,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    }

    // Log the bug report (in production, save to database)
    console.log('Bug Report Submitted:', {
      ...bugReport,
      screenshotSize: screenshot ? screenshot.data.length : 0
    })

    // Return success response
    return {
      success: true,
      message: 'Bug report submitted successfully',
      data: {
        id: bugReport.id,
        submittedAt: bugReport.submittedAt
      }
    }

  } catch (error: any) {
    // Handle any errors
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error processing bug report:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while processing bug report'
    })
  }
}) 