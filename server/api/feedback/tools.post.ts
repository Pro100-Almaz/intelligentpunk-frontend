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
    
    // Parse JSON body
    const body = await readBody(event)
    
    if (!body) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No request body received'
      })
    }

    // Extract and validate required fields
    const { name, category, description } = body

    if (!name || !category || !description) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Name, category, and description are required'
      })
    }

    // Validate category (optional - you can customize this list)
    const validCategories = [
      'General',
      'Productivity', 
      'Design',
      'Development',
      'Marketing',
      'Analytics',
      'Communication'
    ]

    if (!validCategories.includes(category)) {
      throw createError({
        statusCode: 400,
        statusMessage: `Invalid category. Must be one of: ${validCategories.join(', ')}`
      })
    }

    // Here you would typically:
    // 1. Save the tool suggestion to a database
    // 2. Send notification emails to admins
    // 3. Add to idea voting system
    // 4. Award points to the user
    
    // For now, we'll simulate processing and return success
    const toolSuggestion = {
      id: Math.floor(Math.random() * 10000),
      name: name.trim(),
      category,
      description: description.trim(),
      submittedAt: new Date().toISOString(),
      status: 'submitted',
      votes: 0
    }

    // Log the tool suggestion (in production, save to database)
    console.log('Tool Suggestion Submitted:', toolSuggestion)

    // Return success response
    return {
      success: true,
      message: 'Tool suggestion submitted successfully',
      data: {
        id: toolSuggestion.id,
        submittedAt: toolSuggestion.submittedAt
      }
    }

  } catch (error: any) {
    // Handle any errors
    if (error.statusCode) {
      throw error
    }
    
    console.error('Error processing tool suggestion:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error while processing tool suggestion'
    })
  }
}) 