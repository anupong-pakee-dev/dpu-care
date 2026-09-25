export const formatBold = text => {
    const cleanedText = text.replace(/(\w)\*(\W|$)/g, '$1$2');

    const regex = /(\*\*(.*?)\*\*|\*(.*?)\*)/g;

    const elements = [];
    let lastIndex = 0;
    let match;
    let key = 0;

    while ((match = regex.exec(cleanedText)) !== null) {
        if (match.index > lastIndex) {
            elements.push(cleanedText.slice(lastIndex, match.index));
        }

        if (match[2]) {
            elements.push(<strong key={key++}>{match[2]}</strong>);
        } else if (match[3]) {
            elements.push(<em key={key++}>{match[3]}</em>);
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < cleanedText.length) {
        elements.push(cleanedText.slice(lastIndex));
    }

    return elements;
}

export const formatNumber = num => {
    if (num >= 1_000_000_000) {
        return (num / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';
    }
    if (num >= 1_000_000) {
        return (num / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';
    }
    if (num >= 1_000) {
        return (num / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';
    }
    return num.toString();
}

export const formatDateTime = (value, isTH) => {
    const date = new Date(value);
    if (isNaN(date.getTime())) return value || "-";

    return new Intl.DateTimeFormat(isTH ? "th-TH" : "en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    }).format(date);
}

export const getReportStatusMeta = (status, isTH) => {
    const code = Number(status);

    if (!status || isNaN(code)) {
        return { label: isTH ? "ไม่ทราบสถานะ" : "Unknown", tone: "neutral" };
    }
    if (code >= 500) {
        return { label: `${isTH ? "เซิร์ฟเวอร์ผิดพลาด" : "Server error"} (${code})`, tone: "danger" };
    }
    if (code >= 400) {
        return { label: `${isTH ? "คำขอผิดพลาด" : "Request error"} (${code})`, tone: "warn" };
    }
    return { label: String(code), tone: "neutral" };
}
