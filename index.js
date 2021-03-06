const HEALTHPOT = 6552;
const PERCENT = 0.25;
const HPPOTCOOLDOWN = 10000;
const Command = require('command');

module.exports = function healthPotter(dispatch) {
  const command = Command(dispatch);
  let cid = null,
  player = '',
  enabled = true,
  battleground,
  onmount = false,
  incontract = false,
  inbattleground = false,
  alive = true,
  inCombat = false,
  cooldown = false,
  location,
  placeholder = null,
  curHp = null,
  maxHp = null;

  command.add('hpPot', (arg) => {
    switch (arg) {
      case 'on':
        enabled = true;
        break;
      case 'off':
        enabled = false;
        break;
      default:
        enabled = !enabled;
        break;
    } command.message('HealthPotter ' + (enabled ? 'enabled' : 'disabled') + '.');

  })

  dispatch.hook('S_LOGIN', 1, (event) => {
    ({cid} = event);
    player = event.name;
    enabled = true;
  })

  dispatch.hook('C_PLAYER_LOCATION', 1, event =>{location = event})

  dispatch.hook('S_START_COOLTIME_ITEM', 1, event => {

		if(event.item == HEALTHPOT) { // has 10 seconds cooldown
			cooldown = true
			setTimeout(() => {
				cooldown = false;
        checkHp(); // check hp again when cooldown comes up
			}, HPPOTCOOLDOWN);



		}
	})

  dispatch.hook('S_BATTLE_FIELD_ENTRANCE_INFO', 1, event => { battleground = event.zone })
	dispatch.hook('S_LOAD_TOPO', 1, event => {
		onmount = false
		incontract = false
		inbattleground = event.zone == battleground
	})
  dispatch.hook('S_SPAWN_ME', 1, event => {
		alive = event.alive
	})
  dispatch.hook('S_USER_STATUS', 1, event => {
		if(event.target.equals(cid)) {
			if(event.status == 1) {
				inCombat = true
			}
			else inCombat = false
		}
	})
  dispatch.hook('S_CREATURE_LIFE', 1, event => {
		if(event.target.equals(cid) && (alive != event.alive)) {
			if(!alive) {
				onmount = false
				incontract = false
        placeholder = null;
			}
		}
	})

  dispatch.hook('S_MOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = true })
	dispatch.hook('S_UNMOUNT_VEHICLE', 1, event => { if(event.target.equals(cid)) onmount = false })

	dispatch.hook('S_REQUEST_CONTRACT', 1, event => { incontract = true })
	dispatch.hook('S_ACCEPT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_REJECT_CONTRACT', 1, event => { incontract = false })
	dispatch.hook('S_CANCEL_CONTRACT', 1, event => { incontract = false })

  dispatch.hook('S_CREATURE_CHANGE_HP', 6, (event) => {

    if (event.target.equals(cid)) {
      curHp = event.curHp;
      maxHp = event.maxHp;
      if (enabled) checkHp();
    }

  })

  function checkHp() {

      percent = curHp / maxHp;
      if (!cooldown && percent <= PERCENT) {
        usePot();
      }

  }

  function usePot() {
    if (!enabled) return;
    if (alive && inCombat && !onmount && !incontract && !inbattleground) {
      dispatch.toServer('C_USE_ITEM', 1, {
        ownerId: cid,
        item: HEALTHPOT,
        id: 0,
        unk1: 0,
        unk2: 0,
        unk3: 0,
        unk4: 1,
        unk5: 0,
        unk6: 0,
        unk7: 0,
        x: location.x1,
        y: location.y1,
        z: location.z1,
        w: location.w,
        unk8: 0,
        unk9: 0,
        unk10: 0,
        unk11: 1
      })
    }

  }

}
