/**
 * Chart rendering utility to display local LLM tokens usages.
 */
let usageChart = null;

async function updateUsageChart() {
    const data = await api.getModelUsage();
    if (!data || data.length === 0) return;

    const ctx = document.getElementById('modelChart').getContext('2d');

    const labels = data.map(d => d.model_name);
    const tokens = data.map(d => d.total_tokens);

    if (usageChart) {
        usageChart.data.labels = labels;
        usageChart.data.datasets[0].data = tokens;
        usageChart.update();
        return;
    }

    usageChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: tokens,
                backgroundColor: [
                    '#6c63ff',
                    '#00d4aa',
                    '#ffb830',
                    '#ff4d6d'
                ],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#adb5bd' }
                }
            },
            cutout: '70%'
        }
    });
}
