const HEALTHPOT = 6552;

module.exports = function healthPotter(dispatch) {

  let cid = null,
  player = '',
  enabled = true,
  battleground,
  onmount,
  incontract,
  inbattleground,
  alive,
  inCombat,
  cooldown = false,
  location;

  command.add('hpPot', (arg) => {
    switch (cmd) {
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
		let item = event.item
		let thiscooldown = event.cooldown

		if(item == HEALTHPOT) { // has 10 seconds cooldown
			cooldown = true
			setTimeout(() => {
				cooldown = false
			}, thiscooldown*1000)
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
    if (!cooldown && event.target.equals(cid) && (curHp/MaxHp <= 0.1))
      usePot();
  })

  function usePot() {
    if (!enabled) return;
    if (alive && inCombat && !onMount && !incontract && inbattleground) {}
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
