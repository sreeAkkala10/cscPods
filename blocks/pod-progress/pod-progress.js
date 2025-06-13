/* eslint-disable no-await-in-loop */
export default async function decorate(block) {
  block.style.display = 'none';
  const anchor = block.querySelector('a');
  const url = anchor.href;

  async function fetchAllRows(urls) {
    let allData = [];
    let offset = 0;
    let total = Infinity;

    while (offset < total) {
      const response = await fetch(`${urls}?offset=${offset}`);
      const json = await response.json();

      if (!json.data || json.data.length === 0) break;

      if (total === Infinity && json.total) {
        total = json.total;
      }

      allData = allData.concat(json.data);
      offset += json.limit || json.data.length;
    }

    return allData;
  }

  const rows = await fetchAllRows(url);

  const podMap = {};
  rows.forEach((row) => {
    const pod = row.Pod;
    const member = row.Member;
    const module = row.Module;
    const status = row.Status || '';

    if (!podMap[pod]) podMap[pod] = {};
    if (!podMap[pod][member]) podMap[pod][member] = [];

    podMap[pod][member].push({ module, status });
  });

  const modal = document.createElement('div');
  modal.className = 'pod-modal';
  modal.style.display = 'none';
  modal.innerHTML = `
    <div class="pod-modal-overlay"></div>
    <div class="pod-modal-content">
      <button class="modal-close">&times;</button>
      <div class="modal-body"></div>
    </div>
  `;
  document.body.appendChild(modal);

  const modalBody = modal.querySelector('.modal-body');
  const closeBtn = modal.querySelector('.modal-close');
  const overlay = modal.querySelector('.pod-modal-overlay');

  const closeModal = () => {
    modal.style.display = 'none';
    modalBody.innerHTML = '';
    document.body.style.overflow = '';
  };

  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', closeModal);

  function showModules(podName, member, modules) {
    modalBody.innerHTML = `<h3>${member}'s Progress</h3>`;

    const total = modules.length;
    const completed = modules.filter(
      (m) => m.status.toLowerCase() === 'completed',
    ).length;
    const percent = completed === 0 ? 0 : Number(((completed / total) * 100).toFixed(2));

    const circle = document.createElement('div');
    circle.className = 'circular-progress';
    circle.innerHTML = `
      <div class="circle">
        <svg>
          <circle cx="60" cy="60" r="50"></circle>
          <circle class="progress" cx="60" cy="60" r="50"
            style="stroke-dashoffset: ${314 - (314 * percent) / 100};"
          ></circle>
        </svg>
        <div class="percentage">${percent}%</div>
      </div>
    `;

    modalBody.appendChild(circle);
  }

  const podBtns = document.querySelectorAll('.select-pod-btn');
  podBtns.forEach((btn) => {
    const podName = btn.querySelector('p')?.textContent.trim();

    btn.addEventListener('click', () => {
      const members = podMap[podName];
      modalBody.innerHTML = `<h3>${podName} Members</h3>`;

      if (!members || Object.keys(members).length === 0) {
        modalBody.innerHTML += '<p>No members found.</p>';
      } else {
        const list = document.createElement('ul');
        Object.keys(members).forEach((member) => {
          const li = document.createElement('li');
          li.textContent = member;
          li.style.cursor = 'pointer';
          li.addEventListener('click', () => {
            showModules(podName, member, members[member]);
          });
          list.appendChild(li);
        });
        modalBody.appendChild(list);
      }

      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    });
  });

  podBtns.forEach((btn) => {
    const podName = btn.querySelector('p')?.textContent.trim();
    const members = podMap[podName];

    if (!members) return;

    const memberPercents = [];

    Object.values(members).forEach((modules) => {
      const total = modules.length;
      const completed = modules.filter(
        (m) => (m.status || '').toLowerCase() === 'completed',
      ).length;
      const percent = Math.round((completed / total) * 100);
      memberPercents.push(percent);
    });
    const avgPercent = memberPercents.length === 0
      ? 0
      : Number((memberPercents.reduce((a, b) => a + b, 0) / memberPercents.length).toFixed(2));

    const circle = document.createElement('div');
    circle.className = 'pod-progress-circle';
    circle.innerHTML = `
      <div class="circle">
        <svg>
          <circle cx="60" cy="60" r="50"></circle>
          <circle class="progress" cx="60" cy="60" r="50"
            style="stroke-dashoffset: ${314 - (314 * avgPercent) / 100};"
          ></circle>
        </svg>
        <div class="percentage">${avgPercent}%</div>
      </div>
    `;

    btn.appendChild(circle);
  });
}
