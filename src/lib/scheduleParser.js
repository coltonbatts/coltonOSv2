/**
 * Parses a markdown string into structured schedule data.
 * @param {string} markdown - The raw markdown content.
 * @returns {object} - { blocks: [], dailyFocus: [], tasks: [] }
 */
export function parseScheduleMarkdown(markdown) {
    const blocks = [];
    const dailyFocus = [];
    const tasks = [];

    const lines = markdown.split('\n');
    let currentDay = null;
    let parsingTable = false;

    // Weekday map for converting names to index (0 = Sun, 1 = Mon, etc.)
    const dayMap = {
        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
        'thursday': 4, 'friday': 5, 'saturday': 6,
        'sun': 0, 'mon': 1, 'tue': 2, 'wed': 3, 'thu': 4, 'fri': 5, 'sat': 6
    };

    // 1. Extract Daily Rhythm Table
    // Look for the table structure: | Block | Time | What |
    const tableStart = lines.findIndex(l => l.includes('| Block | Time | What |'));
    if (tableStart !== -1) {
        let i = tableStart + 2; // Skip header and separator
        const baseDays = [1, 2, 3, 4]; // Default to Mon-Thu per user's doc

        while (i < lines.length && lines[i].trim().startsWith('|')) {
            const parts = lines[i].split('|').map(p => p.trim()).filter(Boolean);
            if (parts.length >= 3) {
                // parts[0] = Block Name (Morning/Lunch)
                // parts[1] = Time Range (9:00–12:00)
                // parts[2] = Description (Deep work)

                const timeRange = parts[1].replace('–', '-'); // Normalize en-dash
                const [start, end] = timeRange.split('-');
                const title = parts[2];
                const type = title.toLowerCase().includes('break') || title.toLowerCase().includes('lunch') ? 'break' : 'block';

                // rudimentary color mapping
                let color = 'blue';
                if (type === 'break') color = 'slate';
                if (title.toLowerCase().includes('wind down')) color = 'indigo';

                blocks.push({
                    title: title,
                    type: type,
                    startTime: normalizeTime(start),
                    endTime: normalizeTime(end),
                    days: baseDays,
                    color: color
                });
            }
            i++;
        }
    }

    // 2. Extract Daily Focuses and Tasks
    // Look for "## Monday — Setup & Learn" patterns
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Check for Day Header
        if (line.startsWith('## ')) {
            const headerText = line.replace('## ', '').toLowerCase();
            // Try to match specific day names
            for (const [dayName, dayIndex] of Object.entries(dayMap)) {
                if (headerText.includes(dayName)) {
                    currentDay = dayIndex;

                    // Extract Focus if present in header (e.g. "Monday — Setup & Learn")
                    if (line.includes('—') || line.includes('-')) {
                        const focusPart = line.split(/[—–-]/).slice(1).join(' ').trim();
                        if (focusPart) {
                            dailyFocus.push({
                                dayIndex: dayIndex,
                                title: focusPart,
                                color: getFocusColor(dayIndex)
                            });
                        }
                    }
                    break;
                }
            }
            continue;
        }

        // Capture explicit "Focus:" lines if we are inside a day
        if (currentDay !== null && line.trim().toLowerCase().startsWith('**focus:**')) {
            const text = line.replace(/\*\*focus:\*\*/i, '').replace('Focus:', '').trim();
            // If we didn't get focus from header, or want to overwrite/append? 
            // For now, let's treat this as the definitive description of the day
            // Check if we already have a focus entry for this day
            const existing = dailyFocus.find(f => f.dayIndex === currentDay);
            if (existing) {
                existing.description = text; // Add detail
            } else {
                dailyFocus.push({
                    dayIndex: currentDay,
                    title: text, // Fallback title
                    color: getFocusColor(currentDay)
                });
            }
        }

        // Capture Tasks
        if (currentDay !== null && line.trim().startsWith('- [ ]')) {
            const taskText = line.replace('- [ ]', '').trim();
            // Remove markdown bolding if present
            const cleanText = taskText.replace(/\*\*/g, '');
            tasks.push({
                text: cleanText,
                completed: false,
                dayIndex: currentDay
            });
        }

        // Reset currentDay if we hit a separator
        if (line.trim() === '---') {
            currentDay = null;
        }
    }

    return { blocks, dailyFocus, tasks };
}

// Helpers
function normalizeTime(timeStr) {
    if (!timeStr) return "09:00";
    timeStr = timeStr.trim().toLowerCase();

    // Handle "9:00" -> "09:00"
    if (timeStr.indexOf(':') === 1) timeStr = '0' + timeStr;

    // Handle AM/PM if present
    if (timeStr.includes('pm') && !timeStr.startsWith('12')) {
        const [h, m] = timeStr.replace('pm', '').split(':');
        return `${parseInt(h) + 12}:${m || '00'}`;
    }

    // Infer PM for business hours (1-6) if no AM/PM specified
    const hourVal = parseInt(timeStr.split(':')[0]);
    if (hourVal >= 1 && hourVal <= 6) {
        const [h, m] = timeStr.split(':');
        return `${parseInt(h) + 12}:${m || '00'}`;
    }

    return timeStr.replace(/[^0-9:]/g, ''); // Strip non-numeric/colon
}

function getFocusColor(dayIndex) {
    const map = {
        1: 'blue', 2: 'purple', 3: 'yellow', 4: 'orange', 5: 'emerald'
    };
    return map[dayIndex] || 'blue';
}
