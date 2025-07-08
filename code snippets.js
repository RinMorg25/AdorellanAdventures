   _findInList(partialName, list) {
        if (!partialName || !list || list.length === 0) return null;
        const lowerCasePartialName = partialName.toLowerCase();

        // 1. Prioritize exact match.
        // This prevents 'use potion' from using a 'super potion' if a regular 'potion' also exists.
        let entity = list.find(e => e.name.toLowerCase() === lowerCasePartialName);
        if (entity) return entity;

        // 2. Fallback to partial match (finds the first one).
        // This allows 'inspect fan' to find 'blue feather hand fan'.
        return list.find(e => e.name.toLowerCase().includes(lowerCasePartialName));
    }

    